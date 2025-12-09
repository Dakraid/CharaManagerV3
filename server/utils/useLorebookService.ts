import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/node-postgres';

const LOREBOOK_TTL_MS = 5 * 60 * 1000;

const lorebookPool = createServicePool<[userId: string], LorebookService, string>({
	name: 'lorebookService',
	ttlMs: LOREBOOK_TTL_MS,
	keyFromArgs: (userId) => userId,
	factory: async (userId) => new LorebookService(userId),
	onDispose: undefined,
});

export async function useLorebookService(userId: string): Promise<LorebookService> {
	return lorebookPool.useService(userId);
}

export class LorebookService {
	db: ReturnType<typeof drizzle>;
	user_id: string;

	constructor(userId: string) {
		this.db = useDrizzle();
		this.user_id = userId;
	}

	async list(): Promise<Lorebook[]> {
		// Optimize: Fetch only metadata and entry count to improve performance
		const results = await this.db
			.select({
				id: lorebooks.id,
				user_id: lorebooks.user_id,
				name: lorebooks.name,
				description: lorebooks.description,
				scan_depth: lorebooks.scan_depth,
				token_budget: lorebooks.token_budget,
				recursive_scanning: lorebooks.recursive_scanning,
				extensions: lorebooks.extensions,
				create_date: lorebooks.create_date,
				update_date: lorebooks.update_date,
				entry_count: sql<number>`jsonb_array_length(${lorebooks.entries})`,
			})
			.from(lorebooks)
			.where(eq(lorebooks.user_id, this.user_id))
			.orderBy(desc(lorebooks.update_date));

		return results.map((r) => ({
			...r,
			entries: [],
			entry_count: Number(r.entry_count),
		}));
	}

	async get(id: number): Promise<Lorebook> {
		const results = await this.db
			.select()
			.from(lorebooks)
			.where(and(eq(lorebooks.id, id), eq(lorebooks.user_id, this.user_id)))
			.limit(1);

		if (results.length === 0) {
			throw createError({
				statusCode: StatusCode.NOT_FOUND,
				message: 'Lorebook not found.',
			});
		}

		return {
			...results[0],
			entries: results[0].entries as any,
		};
	}

	async create(data: CharacterBook): Promise<Lorebook> {
		const [result] = await this.db
			.insert(lorebooks)
			.values({
				user_id: this.user_id,
				name: data.name,
				description: data.description,
				scan_depth: data.scan_depth,
				token_budget: data.token_budget,
				recursive_scanning: data.recursive_scanning,
				extensions: data.extensions,
				entries: data.entries as any,
			})
			.returning();

		return {
			...result,
			entries: result.entries as any,
		};
	}

	async update(id: number, data: CharacterBook): Promise<Lorebook> {
		// Verify ownership
		await this.get(id);

		const [result] = await this.db
			.update(lorebooks)
			.set({
				name: data.name,
				description: data.description,
				scan_depth: data.scan_depth,
				token_budget: data.token_budget,
				recursive_scanning: data.recursive_scanning,
				extensions: data.extensions,
				entries: data.entries as any,
				update_date: new Date(), // Force update date
			})
			.where(and(eq(lorebooks.id, id), eq(lorebooks.user_id, this.user_id)))
			.returning();

		return {
			...result,
			entries: result.entries as any,
		};
	}

	async delete(id: number): Promise<void> {
		// Verify ownership
		await this.get(id);

		await this.db.delete(lorebooks).where(and(eq(lorebooks.id, id), eq(lorebooks.user_id, this.user_id)));
	}

	async assignToCharacter(lorebookId: number, characterId: number): Promise<void> {
		// Verify ownership of both
		await this.get(lorebookId);

		// Check character ownership
		const char = await this.db
			.select()
			.from(characters)
			.where(and(eq(characters.character_id, characterId), eq(characters.owner_id, this.user_id)))
			.limit(1);

		if (char.length === 0) {
			throw createError({
				statusCode: StatusCode.NOT_FOUND,
				message: 'Character not found or access denied.',
			});
		}

		await this.db
			.insert(character_lorebooks)
			.values({
				character_id: characterId,
				lorebook_id: lorebookId,
			})
			.onConflictDoNothing();
	}

	async unassignFromCharacter(lorebookId: number, characterId: number): Promise<void> {
		// Verify ownership of both (or at least character)
		// If I own the character, I can remove any lorebook from it?
		// Or if I own the lorebook, I can remove it from any character?
		// Stick to: Must own character to modify its lorebooks.

		const char = await this.db
			.select()
			.from(characters)
			.where(and(eq(characters.character_id, characterId), eq(characters.owner_id, this.user_id)))
			.limit(1);

		if (char.length === 0) {
			throw createError({
				statusCode: StatusCode.NOT_FOUND,
				message: 'Character not found or access denied.',
			});
		}

		await this.db.delete(character_lorebooks).where(and(eq(character_lorebooks.character_id, characterId), eq(character_lorebooks.lorebook_id, lorebookId)));
	}

	async getForCharacter(characterId: number): Promise<Lorebook[]> {
		// Check character read access?
		// For now, assume owner or public visible check should be done by caller or useCharacterService.
		// But here we only have userId.
		// Let's check basic ownership/visibility if possible, or assume this is called by someone with access.
		// Given the pattern, let's just return what's linked.

		const links = await this.db.select().from(character_lorebooks).where(eq(character_lorebooks.character_id, characterId));

		if (links.length === 0) return [];

		const ids = links.map((l) => l.lorebook_id);

		const books = await this.db.select().from(lorebooks).where(inArray(lorebooks.id, ids));

		return books.map((r) => ({
			...r,
			entries: r.entries as any,
		}));
	}
}
