// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticateOptional(event);
	const request = await validateRequestBody(event, characterIdSchema);
	setHeader(event, 'Content-Type', 'image/png');
	setHeader(event, 'Content-Disposition', `attachment; filename="${request.id}.png"`);
	const characterService = await useCharacterService(request.id, userId ?? '00000000-0000-0000-0000-000000000000');
	return characterService.download();
});
