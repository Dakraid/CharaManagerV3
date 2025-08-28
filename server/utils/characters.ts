import type { V2 } from 'character-card-utils';
import safeDestr from 'destr';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

export async function hasAccess(characterId: number, userId: string): Promise<boolean> {
	const db = useDrizzle();
	const result = await db.execute(sql<boolean>`SELECT public.has_access(${userId}, ${characterId})`);

	return result.rows[0]['has_access'] === true;
}

export async function getCharacterCount(userId?: string): Promise<number> {
	const db = useDrizzle();

	let result: number;
	if (userId) {
		result = await db.$count(characters, or(eq(characters.public_visible, true), eq(characters.owner_id, userId)));
	} else {
		result = await db.$count(characters, eq(characters.public_visible, true));
	}

	return result;
}

export async function getCharacterList(perPage: number, page: number, userId?: string): Promise<CharacterList> {
	const db = useDrizzle();

	const count = await getCharacterCount(userId);
	const cacheKey = `${count}-${perPage}-${page}-${userId ?? 'public'}`;
	try {
		const cached = await useCache().getItem(cacheKey);
		if (cached) {
			const results = safeDestr<Character[]>(cached);
			return { characterArray: results };
		}
	} catch (error: any) {
		console.error(error);
	}

	let items: CharacterWithOwnerId[];

	if (userId) {
		items = await db
			.select()
			.from(characters)
			.where(or(eq(characters.public_visible, true), eq(characters.owner_id, userId)))
			.orderBy(desc(characters.character_id))
			.limit(perPage)
			.offset(perPage * (page - 1));
	} else {
		items = await db
			.select()
			.from(characters)
			.where(eq(characters.public_visible, true))
			.orderBy(desc(characters.character_id))
			.limit(perPage)
			.offset(perPage * (page - 1));
	}

	const results: Character[] = items.map((item) => ({
		character_id: item.character_id,
		public_visible: item.public_visible,
		character_name: item.character_name,
		upload_date: item.upload_date,
		image_etag: item.image_etag,
		total_token_count: item.total_token_count,
		perma_token_count: item.perma_token_count,
		evaluation_score: item.evaluation_score,
		owned: userId ? item.owner_id === userId : false,
	}));

	const json = JSON.stringify(results);
	try {
		await useCache().setItem(cacheKey, json);
	} catch (error: any) {
		console.error(error);
	}

	return { characterArray: results };
}

export async function getCombinedDefinitionById(characterId: number): Promise<string> {
	try {
		const db = useDrizzle();

		const result = await db
			.select({
				content: definitions.content,
				description: definitions.description,
				personality: definitions.personality,
				scenario: definitions.scenario,
			})
			.from(definitions)
			.where(eq(definitions.character_id, characterId))
			.orderBy(desc(definitions.change_date))
			.limit(1);

		if (result.length === 0) {
			throw createError({
				statusCode: StatusCode.NOT_FOUND,
				message: 'Character definition not found.',
			});
		}

		const definition = result[0];
		let combinedText: string;

		if (definition.description) {
			combinedText = [definition.description, definition.personality || '', definition.scenario || ''].filter((text) => text.trim() !== '').join('\n');
		} else {
			combinedText = [definition.content.data.description, definition.content.data.personality || '', definition.content.data.scenario || '']
				.filter((text) => text.trim() !== '')
				.join('\n');
		}

		if (!combinedText.trim()) {
			throw createError({
				statusCode: StatusCode.BAD_REQUEST,
				message: 'Character has no content to generate embeddings from.',
			});
		}

		return combinedText;
	} catch (error: any) {
		throw createError({
			statusCode: StatusCode.INTERNAL_SERVER_ERROR,
			message: error.message,
		});
	}
}

export async function getCharacterById(characterId: number, userId: string): Promise<FullCharacter | undefined> {
	const db = useDrizzle();

	if (await hasAccess(characterId, userId)) {
		try {
			const result = await db
				.select()
				.from(characters)
				.innerJoin(definitions, eq(definitions.character_id, characters.character_id))
				.where(and(eq(characters.character_id, characterId), eq(characters.owner_id, userId)));

			if (result.length === 0) {
				return undefined;
			}

			return { character: result[0].characters, definition: result[0].definitions };
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	return undefined;
}

export async function deleteCharacterById(characterId: number, userId: string): Promise<responseType> {
	const db = useDrizzle();

	if (await hasAccess(characterId, userId)) {
		try {
			await db.delete(characters).where(eq(characters.character_id, characterId));
			await deleteImageById(characterId);
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	return { statusCode: StatusCode.OK, message: 'Character deleted successfully.' };
}

export async function updateCharacterVisibilityById(characterId: number, publicVisible: boolean, userId: string): Promise<responseType> {
	const db = useDrizzle();

	if (await hasAccess(characterId, userId)) {
		try {
			await db.update(characters).set({ public_visible: publicVisible }).where(eq(characters.character_id, characterId));
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	return { statusCode: StatusCode.OK, message: 'Visibility changed successfully.' };
}

export async function updateCharacterDefinitionById(characterId: number, userId: string, definition: V2): Promise<responseType> {
	const db = useDrizzle();

	if (await hasAccess(characterId, userId)) {
		try {
			await db.update(characters).set({ character_name: definition.data.name }).where(eq(characters.character_id, characterId));
			await db.update(definitions).set({ content: definition }).where(eq(characters.character_id, characterId));
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	}

	return { statusCode: StatusCode.OK, message: 'Visibility changed successfully.' };
}

export async function downloadCharacterById(characterId: number, userId: string): Promise<Blob | undefined> {
	const db = useDrizzle();
	let definition: V2;

	if (await hasAccess(characterId, userId)) {
		try {
			const result = await db.select({ definition: definitions.content }).from(definitions).where(eq(definitions.character_id, characterId));
			const definitionRaw = result[0].definition;
			definition = safeDestr<V2>(definitionRaw);
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		const image = await loadImageById(characterId, false);

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
}

export async function saveCharacter(upload: Upload, userId: string): Promise<UploadResult> {
	const db = useDrizzle();

	return await db.transaction(async (tx) => {
		let characterId: number = -1;
		try {
			const file = await upload.file.bytes();
			const fileText = await fileToText(upload.file);

			const { png, definition } = extractTextAndStripPng(file);

			const matchingOriginals = await tx.select().from(originals).where(eq(originals.file_raw, fileText));
			const contentHash = await db.execute(sql<boolean>`SELECT public.hash_content(${definition})`);
			const contentHashRaw = (contentHash.rows[0]['hash_content'] as string) || '';
			const matchingHashes = await tx.select().from(definitions).where(eq(definitions.hash, contentHashRaw));
			if (matchingOriginals.length > 0 || matchingHashes.length > 0) {
				throw new Error('File already exists.');
			}

			const { total, perma } = countTokens(definition);

			const [character] = await tx
				.insert(characters)
				.values({
					owner_id: userId,
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
			await generateCharacterEmbedding(characterId, userId);

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
}
