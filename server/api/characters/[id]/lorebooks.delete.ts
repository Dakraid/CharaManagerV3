import { z } from 'zod';

const unassignSchema = z.object({
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

	const body = await readValidatedBody(event, unassignSchema.parse);
	const lorebookService = await useLorebookService(session.user.id);

	await lorebookService.unassignFromCharacter(body.lorebook_id, parseInt(characterId));
	return { success: true };
});
