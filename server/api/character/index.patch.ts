// noinspection JSUnusedGlobalSymbols
import type { V2 } from 'character-card-utils';

export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, definitionChangeSchema);
	return await useCharacterService(request.id, userId ?? '00000000-0000-0000-0000-000000000000').updateDefinition(request.content as V2);
});
