import { z } from 'zod';

const assignSchema = z.object({
	lorebook_id: z.number(),
});

export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	const characterId = getRouterParam(event, 'id');

	if (!characterId) {
		throw createError({
			statusCode: 400,
			message: 'Missing character ID',
		});
	}

	const body = await readValidatedBody(event, assignSchema.parse);
	const lorebookService = await useLorebookService(session.user.id);

	await lorebookService.assignToCharacter(body.lorebook_id, parseInt(characterId));
	return { success: true };
});
