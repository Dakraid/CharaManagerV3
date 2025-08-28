// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, visibilityChangeSchema);
	return await useCharacterService(request.id, userId).updateVisibility(request.public);
});
