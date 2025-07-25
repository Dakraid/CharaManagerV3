import type { V2 } from 'character-card-utils';
import safeDestr from 'destr';
import { desc, eq, or, sql } from 'drizzle-orm';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const runtimeConfig = useRuntimeConfig();

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

		const image = await loadImageById(characterId);

		if (!definition || !image) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: 'Failed to load character definition or image.',
			});
		}

		const png = embedTextInPng(image, definition);
		return new Blob([png]);
	}
}

// Character Upload Handling
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

// Character Image Handling
export async function loadImageById(id: number): Promise<Uint8Array> {
	try {
		const value = await useCache().getItemRaw<Uint8Array>(id.toString());
		if (value) {
			return value;
		}

		const file = await fs.readFile(path.join(runtimeConfig.imageFolder, `${id}.png`));
		await useCache().setItemRaw(id.toString(), file);

		return file;
	} catch (error: any) {
		throw new Error(`Failed to load image to file system: ${error.message}`);
	}
}

export async function saveImageById(id: number, data: Uint8Array): Promise<void> {
	try {
		await fs.writeFile(path.join(runtimeConfig.imageFolder, `${id}.png`), data);
		await useCache().setItemRaw(id.toString(), data);
	} catch (error: any) {
		throw new Error(`Failed to save image to file system: ${error.message}`);
	}
}

export async function deleteImageById(id: number): Promise<void> {
	try {
		await fs.unlink(path.join(runtimeConfig.imageFolder, `${id}.png`));
	} catch (error: any) {
		throw new Error(`Failed to save image to file system: ${error.message}`);
	}
}
