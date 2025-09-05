// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);
	const request = await validateRequestBody(event, definitionLLMSchema);
	const llmService = await useLLMService(userId);
	return await llmService.getCorrection(request);
});
