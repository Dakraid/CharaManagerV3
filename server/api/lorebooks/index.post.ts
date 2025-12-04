export default defineEventHandler(async (event) => {
	const session = await requireUserSession(event);
	const body = await readValidatedBody(event, lorebookSchema.parse);

	const lorebookService = await useLorebookService(session.user.id);
	return await lorebookService.create(body as CharacterBook);
});
