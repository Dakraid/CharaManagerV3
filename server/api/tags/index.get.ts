// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const managerService = await useManagerService(userId);
	return await managerService.get(request.perPage, request.page);
});
