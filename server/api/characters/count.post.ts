// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticateOptional(event);
	return await getCharacterCount(userId);
});
