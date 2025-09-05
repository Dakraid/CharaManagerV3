// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestQuery(event, characterIdSchema);
	const characterService = await useCharacterService(request.id, userId ?? '00000000-0000-0000-0000-000000000000');
	return await characterService.getEvaluation();
});
