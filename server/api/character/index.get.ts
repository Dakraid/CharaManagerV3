// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestQuery(event, characterIdSchema);
	return await getCharacterById(request.id, userId);
});
