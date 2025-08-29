// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticateOptional(event);
	const managerService = await useManagerService(userId);
	return await managerService.count();
});
