export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	const id = getRouterParam(event, 'id');

	if (!id) {
		throw createError({
			statusCode: 400,
			message: 'Missing lorebook ID',
		});
	}

	const body = await readValidatedBody(event, lorebookSchema.parse);
	const lorebookService = await useLorebookService(session.user.id);
	return await lorebookService.update(parseInt(id), body as CharacterBook);
});
