export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	const id = getRouterParam(event, 'id');

	if (!id) {
		throw createError({
			statusCode: 400,
			message: 'Missing lorebook ID',
		});
	}

	const lorebookService = await useLorebookService(session.user.id);
	await lorebookService.delete(parseInt(id));
	return { success: true };
});
