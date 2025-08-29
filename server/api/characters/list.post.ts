// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticateOptional(event);
	const request = await validateRequestBody(event, listingSchema);
	const managerService = await useManagerService(userId);
	return await managerService.get(request.perPage, request.page);
});
