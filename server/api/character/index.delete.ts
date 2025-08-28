// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, characterIdSchema);
	return await deleteCharacterById(request.id, userId);
});
