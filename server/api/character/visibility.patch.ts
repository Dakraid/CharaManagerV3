// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, visibilityChangeSchema);
	return await updateCharacterVisibilityById(request.id, userId, request.public);
});
