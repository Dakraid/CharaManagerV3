// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, definitionChangeSchema);
	return await updateCharacterDefinitionById(request.id, userId, request.content);
});
