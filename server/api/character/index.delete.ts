// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, characterIdSchema);
	return await useCharacterService(request.id, userId ?? '00000000-0000-0000-0000-000000000000').delete();
});
