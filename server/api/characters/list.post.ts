// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticateOptional(event);
	const request = await validateRequestBody(event, listingSchema);
	return await getCharacterList(request.perPage, request.page, userId);
});
