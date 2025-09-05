import type { V2 } from 'character-card-utils';
import safeDestr from 'destr';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/node-postgres';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import type Evaluation from '~/components/Character/Card/Evaluation.vue';

const CHARACTER_TTL_MS = 60 * 1000;

const characterPool = createServicePool<[characterId: number, userId: string], characterService, string>({
	name: 'characterService',
	ttlMs: CHARACTER_TTL_MS,
	keyFromArgs: (characterId, userId) => `${characterId}-${userId}`,
	factory: async (characterId, userId) => new characterService(characterId, userId),
	onDispose: undefined,
});

export async function useCharacterService(characterId: number, userId: string): Promise<characterService> {
	return characterPool.useService(characterId, userId);
}

class characterService {
	// Database Connection Instance
	db: ReturnType<typeof drizzle>;
	// Identifiers
	user_id: string;
	character_id: number;
	// Permissions
	read: boolean = false;
	write: boolean = false;
	public: boolean = false;

	constructor(characterId: number, userId: string) {
		this.db = useDrizzle();

		this.user_id = userId;
		this.character_id = characterId;

		this.db.execute(sql<boolean>`SELECT public.has_read_access(${this.user_id}, ${this.character_id})`).then((result) => {
			this.read = result.rows[0]['has_read_access'] == true;
		});

		this.db.execute(sql<boolean>`SELECT public.has_write_access(${this.user_id}, ${this.character_id})`).then((result) => {
			this.write = result.rows[0]['has_write_access'] == true && this.user_id !== '00000000-0000-0000-0000-000000000000';
		});
	}

	async refresh() {
		const hasRead = await this.db.execute(sql<boolean>`SELECT public.has_read_access(${this.user_id}, ${this.character_id})`);
		const hasWrite = await this.db.execute(sql<boolean>`SELECT public.has_write_access(${this.user_id}, ${this.character_id})`);
		this.read = hasRead.rows[0]['has_read_access'] == true;
		this.write = hasWrite.rows[0]['has_write_access'] == true && this.user_id !== '00000000-0000-0000-0000-000000000000';
	}

	async get(include_definition: boolean = false): Promise<{ character: Character; definition?: Definition }> {
		await this.refresh();
		if (!this.read) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have read access to this character.',
			});
		}

		if (include_definition) {
			try {
				const select = await this.db
					.select()
					.from(characters)
					.innerJoin(definitions, eq(definitions.character_id, characters.character_id))
					.where(and(eq(characters.character_id, this.character_id), eq(characters.owner_id, this.user_id)))
					.orderBy(desc(definitions.change_date))
					.limit(1);

				if (select.length === 0) {
					throw createError({
						statusCode: StatusCode.NOT_FOUND,
						message: 'Character not found.',
					});
				}

				return { character: select[0].characters, definition: select[0].definitions };
			} catch (error: any) {
				throw createError({
					statusCode: StatusCode.INTERNAL_SERVER_ERROR,
					message: error.message,
				});
			}
		}

		try {
			const select = await this.db
				.select()
				.from(characters)
				.where(and(eq(characters.character_id, this.character_id), eq(characters.owner_id, this.user_id)))
				.limit(1);

			if (select.length === 0) {
				throw createError({
					statusCode: StatusCode.NOT_FOUND,
					message: 'Character not found.',
				});
			}

			return { character: select[0], definition: undefined };
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	async getDefinitionText(): Promise<string> {
		await this.refresh();
		if (!this.read) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have read access to this character.',
			});
		}

		const select = await this.db
			.select({
				content: definitions.content,
				description: definitions.description,
				personality: definitions.personality,
				scenario: definitions.scenario,
			})
			.from(definitions)
			.where(eq(definitions.character_id, this.character_id))
			.orderBy(desc(definitions.change_date))
			.limit(1);

		if (select.length === 0) {
			throw createError({
				statusCode: StatusCode.NOT_FOUND,
				message: 'Character definition not found.',
			});
		}

		const definition = select[0];
		const description = definition.description || definition.content.data.description;
		const personality = definition.personality || definition.content.data.personality;
		const scenario = definition.scenario || definition.content.data.scenario;
		const combinedText = [
			'# Character Name\n' + definition.content.data.name,
			'# Description\n' + description,
			personality ? '\n# Personality\n' + personality : '',
			scenario ? '\n# Scenario\n' + scenario : '',
		]
			.filter((text) => text.trim() !== '')
			.join('\n');

		if (!combinedText.trim()) {
			throw createError({
				statusCode: StatusCode.BAD_REQUEST,
				message: 'Character has no content to generate embeddings from.',
			});
		}

		return combinedText;
	}

	async getEvaluation(): Promise<Evaluation | undefined> {
		await this.refresh();
		if (!this.read) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have read access to this character.',
			});
		}

		try {
			const definition_id_select = await this.db
				.select({
					definition_id: definitions.id,
				})
				.from(definitions)
				.where(eq(definitions.character_id, this.character_id))
				.orderBy(desc(definitions.change_date))
				.limit(1);
			const definition_id = definition_id_select[0].definition_id;

			const evaluation_select = await this.db
				.select({ evaluation: evaluations.evaluation_result })
				.from(evaluations)
				.where(eq(evaluations.definition_id, definition_id))
				.orderBy(desc(evaluations.evaluation_date))
				.limit(1);

			if (evaluation_select.length === 0) {
				return undefined;
			}

			return evaluation_select[0].evaluation as Evaluation;
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	async download(): Promise<Blob> {
		await this.refresh();
		if (!this.read) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have read access to this character.',
			});
		}

		let definition: V2;
		try {
			const result = await this.db
				.select({ definition: definitions.content })
				.from(definitions)
				.where(eq(definitions.character_id, this.character_id))
				.orderBy(desc(definitions.change_date))
				.limit(1);
			const definitionRaw = result[0].definition;
			definition = safeDestr<V2>(definitionRaw);
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		const image = await loadImageById(this.character_id, false);

		if (!definition || !image) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: 'Failed to load character definition or image.',
			});
		}

		const imagePng = await sharp(image).png().toBuffer();
		const png = embedTextInPng(imagePng, definition);
		return new Blob([png]);
	}

	async delete(): Promise<responseType> {
		await this.refresh();
		if (!this.read || !this.write) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have write access to this character.',
			});
		}

		try {
			await this.db.delete(characters).where(eq(characters.character_id, this.character_id));
			await deleteImageById(this.character_id);
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		return { statusCode: StatusCode.OK, message: 'Character deleted successfully.' };
	}

	async updateDefinition(definition: V2): Promise<responseType> {
		await this.refresh();
		if (!this.read || !this.write) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have write access to this character.',
			});
		}

		try {
			await this.db.update(characters).set({ character_name: definition.data.name }).where(eq(characters.character_id, this.character_id));
			await this.db.insert(definitions).values({
				character_id: this.character_id,
				content: definition,
			});
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		try {
			await this.updateEmbeddings();
		} catch (error: any) {
			// Ignore errors here, we don't want to block the user from uploading a character.
			console.error('Error updating embeddings:', error);
		}

		return { statusCode: StatusCode.OK, message: 'Character updated successfully.' };
	}

	async updateVisibility(publicVisible: boolean): Promise<responseType> {
		await this.refresh();
		if (!this.read || !this.write) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have write access to this character.',
			});
		}

		try {
			await this.db.update(characters).set({ public_visible: publicVisible }).where(eq(characters.character_id, this.character_id));
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		return { statusCode: StatusCode.OK, message: 'Visibility updated successfully.' };
	}

	async updateImage(image: Blob): Promise<responseType> {
		await this.refresh();
		if (!this.read || !this.write) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have write access to this character.',
			});
		}

		let data = await image.bytes();
		if (image.type === 'image/png') {
			data = cleanPNG(data);
		}

		await saveImageById(this.character_id, data);

		try {
			await this.db
				.update(characters)
				.set({ image_etag: createHash('md5').update(data).digest('hex') })
				.where(eq(characters.character_id, this.character_id));
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		return { statusCode: StatusCode.OK, message: 'Image updated successfully.' };
	}

	async updateEmbeddings(): Promise<responseType> {
		await this.refresh();
		if (!this.read || !this.write) {
			throw createError({
				statusCode: StatusCode.UNAUTHORIZED,
				message: 'User does not have write access to this character.',
			});
		}

		try {
			const text = await this.getDefinitionText();
			const embedding = await generateEmbedding(text);
			await this.db.update(characters).set({ embeddings: embedding }).where(eq(characters.character_id, this.character_id));
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		return {
			statusCode: StatusCode.OK,
			message: 'Character embedding generated successfully.',
		};
	}
}
