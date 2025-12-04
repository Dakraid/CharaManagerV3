export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	const lorebookService = await useLorebookService(session.user.id);
	return await lorebookService.list();
});
