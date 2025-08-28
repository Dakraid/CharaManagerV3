import { eq } from 'drizzle-orm';

export async function generateCharacterEmbedding(characterId: number, userId: string): Promise<responseType> {
	if (await hasAccess(characterId, userId)) {
		try {
			const db = useDrizzle();
			const text = await getCombinedDefinitionById(characterId);
			const embedding = await generateEmbedding(text);
			await db.update(characters).set({ embeddings: embedding }).where(eq(characters.character_id, characterId));

			return {
				statusCode: StatusCode.OK,
				message: 'Character embedding generated successfully.',
			};
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}
	} else {
		throw createError({
			statusCode: StatusCode.UNAUTHORIZED,
			message: 'User has no access to this character.',
		});
	}
}
