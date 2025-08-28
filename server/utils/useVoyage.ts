import { VoyageAIClient } from 'voyageai';

const runtimeConfig = useRuntimeConfig();
let voyageClient: VoyageAIClient | undefined;

export function useVoyage() {
	if (!voyageClient) {
		if (!runtimeConfig.voyageApiKey) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: 'VoyageAI API key not configured.',
			});
		}

		voyageClient = new VoyageAIClient({
			apiKey: runtimeConfig.voyageApiKey,
		});
	}

	return voyageClient;
}

export async function generateEmbedding(text: string): Promise<number[]> {
	try {
		const client = useVoyage();
		const response = await client.embed({
			input: text,
			model: runtimeConfig.voyageModel || 'voyage-3-large',
		});

		if (!response.data || response.data.length === 0 || !response.data[0].embedding) {
			throw new Error('No embedding data returned from VoyageAI');
		}

		return response.data[0].embedding;
	} catch (error: any) {
		throw createError({
			statusCode: StatusCode.INTERNAL_SERVER_ERROR,
			message: `Failed to generate embedding: ${error.message}`,
		});
	}
}
