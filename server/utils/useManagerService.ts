import { safeDestr } from 'destr';
import { desc, eq, or, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/node-postgres';
import { createHash } from 'node:crypto';

const SERVICE_TTL_MS = 10 * 60 * 1000; // 10 minutes of idle time before disposal
const activeManagerServices = new Map<string, ServiceEntry>();

function keyFor(userId: string) {
	return `${userId}`;
}

function scheduleDispose(key: string) {
	const entry = activeManagerServices.get(key);
	if (!entry) return;
	if (entry.timer) clearTimeout(entry.timer);
	entry.timer = setTimeout(() => {
		// If you ever add explicit cleanup in characterService (e.g., close handles), call it here.
		activeManagerServices.delete(key);
	}, SERVICE_TTL_MS);
}

export function useManagerService(userId?: string): managerService {
	const key = keyFor(userId ?? 'public');
	let entry = activeManagerServices.get(key);

	if (!entry) {
		console.log(`Creating new manager service for ${key}...`);
		const service = new managerService(key);
		entry = { service, timer: setTimeout(() => {}, 0) as unknown as NodeJS.Timeout };
		activeManagerServices.set(key, entry);
	}

	// Reset idle timer on every access
	scheduleDispose(key);

	console.log(`Getting manager service for ${key}`);
	console.log(`Currently active manager services: ${activeManagerServices.size}`);
	return entry.service;
}

class managerService {
	// Database Connection Instance
	db: ReturnType<typeof drizzle>;
	// Identifiers
	user_id: string;

	constructor(userId: string) {
		this.db = useDrizzle();
		this.user_id = userId;

		if (userId === 'public') {
			console.log('Public Manager Service Initialized');
		}
	}

	async count() {
		if (this.user_id !== 'public') {
			return await this.db.$count(characters, or(eq(characters.public_visible, true), eq(characters.owner_id, this.user_id)));
		}

		return await this.db.$count(characters, eq(characters.public_visible, true));
	}

	async get(perPage: number, page: number): Promise<Character[]> {
		const count = await this.count();
		const cacheKey = `${count}-${perPage}-${page}-${this.user_id}`;
		try {
			const cached = await useCache().getItem(cacheKey);
			if (cached) {
				return safeDestr<Character[]>(cached);
			}
		} catch (error: any) {
			console.error(error);
		}

		let items: Character[];
		if (this.user_id !== 'public') {
			items = await this.db
				.select()
				.from(characters)
				.where(or(eq(characters.public_visible, true), eq(characters.owner_id, this.user_id)))
				.orderBy(desc(characters.character_id))
				.limit(perPage)
				.offset(perPage * (page - 1));
		} else {
			items = await this.db
				.select()
				.from(characters)
				.where(eq(characters.public_visible, true))
				.orderBy(desc(characters.character_id))
				.limit(perPage)
				.offset(perPage * (page - 1));
		}

		const results = items.map((item) => ({
			character_id: item.character_id,
			public_visible: item.public_visible,
			character_name: item.character_name,
			upload_date: item.upload_date,
			image_etag: item.image_etag,
			total_token_count: item.total_token_count,
			perma_token_count: item.perma_token_count,
			evaluation_score: item.evaluation_score,
			owned: this.user_id ? item.owner_id === this.user_id : false,
		}));

		const json = JSON.stringify(results);
		try {
			await useCache().setItem(cacheKey, json);
		} catch (error: any) {
			console.error(error);
		}

		return results;
	}

	async put(upload: Upload): Promise<UploadResult> {
		if (this.user_id === 'public') {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'Public users are not allowed to upload characters.',
			});
		}

		let characterId: number = -1;
		const result = await this.db.transaction(async (tx) => {
			try {
				const file = await upload.file.bytes();
				const fileText = await fileToText(upload.file);

				const { png, definition } = extractTextAndStripPng(file);

				const matchingOriginals = await tx.select().from(originals).where(eq(originals.file_raw, fileText));
				const contentHash = await this.db.execute(sql<boolean>`SELECT public.hash_content(${definition})`);
				const contentHashRaw = (contentHash.rows[0]['hash_content'] as string) || '';
				const matchingHashes = await tx.select().from(definitions).where(eq(definitions.hash, contentHashRaw));
				if (matchingOriginals.length > 0 || matchingHashes.length > 0) {
					throw new Error('File already exists.');
				}

				const { total, perma } = countTokens(definition);

				const [character] = await tx
					.insert(characters)
					.values({
						owner_id: this.user_id!,
						public_visible: upload.public,
						character_name: definition.data.name,
						image_etag: createHash('md5').update(png).digest('hex'),
						total_token_count: total,
						perma_token_count: perma,
					})
					.returning();

				if (!character) {
					throw new Error('Failed to create character.');
				}

				characterId = character.character_id;
				await tx.insert(originals).values({
					character_id: characterId,
					file_name: upload.file.name,
					file_origin: upload.origin,
					file_raw: fileText,
				});

				await tx.insert(definitions).values({
					character_id: characterId,
					content: definition,
				});

				await saveImageById(characterId, png);

				return { file_name: upload.file.name, success: true };
			} catch (error: any) {
				const originalError = error;
				try {
					if (characterId > 0) {
						await tx.delete(characters).where(eq(characters.character_id, characterId));
					} else {
						tx.rollback();
					}
				} catch (error: any) {
					return { file_name: upload.file.name, success: false, error: originalError.message };
				}
				return { file_name: upload.file.name, success: false, error: originalError.message };
			}
		});

		try {
			await useCharacterService(characterId, this.user_id!).updateEmbeddings();
		} catch (error: any) {
			// Ignore errors here, we don't want to block the user from uploading a character.
		}

		return result;
	}
}
