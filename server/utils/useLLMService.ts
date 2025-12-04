import { eq } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/node-postgres';
import { jsonrepair } from 'jsonrepair';
import { createHash } from 'node:crypto';
import OpenAI from 'openai';

const LLMService_TTL_MS = 10 * 60 * 1000;

const LLMPool = createServicePool<[userId: string], LLMService, string>({
	name: 'LLMService',
	ttlMs: LLMService_TTL_MS,
	keyFromArgs: (userId) => String(userId),
	factory: async (userId) => new LLMService(String(userId)),
	onDispose: undefined,
});

export async function useLLMService(userId: string): Promise<LLMService> {
	return LLMPool.useService(userId);
}

class LLMService {
	// Database Connection Instance
	db: ReturnType<typeof drizzle>;
	// Inference Provider
	ai_client: OpenAI;
	model: string = 'z-ai/glm-4.5';
	// Identifiers
	user_id: string;

	constructor(userId: string) {
		this.db = useDrizzle();
		this.user_id = userId;

		const runtimeConfig = useRuntimeConfig();
		this.ai_client = new OpenAI({
			baseURL: runtimeConfig.llmApiURL,
			apiKey: runtimeConfig.llmApiKey,
		});

		if (runtimeConfig.llmModel !== '') {
			this.model = runtimeConfig.llmModel;
		}
	}

	async parseEvaluationFromCodeBlock(data: string, useRepair = false): Promise<Evaluation | undefined> {
		try {
			const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/;
			const codeBlockMatch = data.match(codeBlockRegex);

			if (codeBlockMatch && codeBlockMatch[1]) {
				const rawData = JSON.parse(useRepair ? jsonrepair(codeBlockMatch[1]) : codeBlockMatch[1]);
				return evaluationSchema.parse(rawData);
			}
		} catch (error) {
			if (error instanceof SyntaxError) {
				if (!useRepair) {
					return this.parseEvaluationFromCodeBlock(data, true);
				}

				console.error('Failed to parse JSON:', error);
			} else {
				console.error('Invalid evaluation data:', error);
			}
		}
	}

	async parseEvaluationFromEntireContent(data: string, useRepair = false): Promise<Evaluation | undefined> {
		try {
			const rawData = JSON.parse(useRepair ? jsonrepair(data) : data);
			return evaluationSchema.parse(rawData);
		} catch (error) {
			if (error instanceof SyntaxError) {
				if (!useRepair) {
					return this.parseEvaluationFromEntireContent(data, true);
				}
				console.error('Failed to parse JSON:', error);
			} else {
				console.error('Invalid evaluation data:', error);
			}
		}
	}

	async getEvaluation(character_id: number): Promise<void> {
		let content: string;
		let definition_id: number;
		try {
			const characterService = await useCharacterService(character_id, this.user_id);
			const character = (await characterService.get()) as FullCharacter;

			if (!character.definition || !character.definition?.description || !character.definition?.content.data.first_mes) {
				throw createError({
					statusCode: StatusCode.BAD_REQUEST,
					message: 'Character definition is missing required fields.',
				});
			}

			definition_id = character.definition.id;
			content = '# DESCRIPTION\n' + character.definition?.description + '\n\n# INTRO\n' + character.definition?.content.data.first_mes;
		} catch (error: any) {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: error.message,
			});
		}

		const runtimeConfig = useRuntimeConfig();
		const completion = await this.ai_client.chat.completions.create({
			model: this.model,
			messages: [
				{ role: 'system', content: runtimeConfig.evaluationPrompt.systemInstruct },
				{
					role: 'user',
					content: content,
				},
			],
			response_format: { type: 'json_object' as const },
		});

		const completionText = completion.choices?.[0]?.message?.content ?? '';

		const parsed = (await this.parseEvaluationFromCodeBlock(completionText)) ?? (await this.parseEvaluationFromEntireContent(completionText));

		if (parsed) {
			try {
				const db = useDrizzle();
				const averageScore = Math.round(
					(parsed.appearance.score +
						parsed.personality.score +
						parsed.background.score +
						parsed.consistency.score +
						parsed.creativeElements.score +
						parsed.grammarAndSpelling.score +
						parsed.structure.score +
						parsed.introduction.score) /
						8
				);
				await db
					.update(characters)
					.set({
						evaluation_score: averageScore,
					})
					.where(eq(characters.character_id, character_id));
				await db.insert(evaluations).values({
					definition_id: definition_id,
					evaluation_version: createHash('md5').update(runtimeConfig.evaluationPrompt.systemInstruct).digest('hex'),
					evaluation_result: parsed,
				});
			} catch (error: any) {
				throw createError({
					statusCode: StatusCode.INTERNAL_SERVER_ERROR,
					message: error.message,
				});
			}
		} else {
			throw createError({
				statusCode: StatusCode.INTERNAL_SERVER_ERROR,
				message: 'Failed to parse evaluation.',
			});
		}
	}

	async getCorrection(definitionParts: DefinitionParts): Promise<DefinitionParts> {
		const runtimeConfig = useRuntimeConfig();

		// Ensure description is provided
		if (!definitionParts.description) {
			throw createError({
				statusCode: StatusCode.BAD_REQUEST,
				message: 'Description is required.',
			});
		}

		// 1) Correct description first (required as context for other fields)
		{
			const systemPrompt = `${runtimeConfig.correctionPrompt.systemInstruct} + \n\n + ${runtimeConfig.correctionPrompt.descriptionRequirements}`;
			const completion = await this.ai_client.chat.completions.create({
				model: this.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: '# INPUT\n' + definitionParts.description },
				],
			});
			const completionText = completion.choices?.[0]?.message?.content;
			if (completionText) {
				definitionParts.description = completionText;
			}
		}

		// 2) Run the rest in parallel using the corrected description as context
		const tasks: Promise<void>[] = [];

		if (isFilled(definitionParts.first_mes)) {
			tasks.push(
				(async () => {
					const systemPrompt = `${runtimeConfig.correctionPrompt.systemInstruct} + \n\n + ${runtimeConfig.correctionPrompt.firstMessageRequirements}`;
					const completion = await this.ai_client.chat.completions.create({
						model: this.model,
						messages: [
							{ role: 'system', content: systemPrompt },
							{
								role: 'user',
								content: '# CONTEXT\n' + definitionParts.description + '\n\n# INPUT\n' + definitionParts.first_mes,
							},
						],
					});
					const completionText = completion.choices?.[0]?.message?.content;
					if (completionText) {
						definitionParts.first_mes = completionText;
					}
				})()
			);
		}

		if (isFilled(definitionParts.personality)) {
			tasks.push(
				(async () => {
					const systemPrompt = `${runtimeConfig.correctionPrompt.systemInstruct} + \n\n + ${runtimeConfig.correctionPrompt.personalityRequirements}`;
					const completion = await this.ai_client.chat.completions.create({
						model: this.model,
						messages: [
							{ role: 'system', content: systemPrompt },
							{
								role: 'user',
								content: '# CONTEXT\n' + definitionParts.description + '\n\n# INPUT\n' + definitionParts.personality,
							},
						],
					});
					const completionText = completion.choices?.[0]?.message?.content;
					if (completionText) {
						definitionParts.personality = completionText;
					}
				})()
			);
		}

		if (isFilled(definitionParts.scenario)) {
			tasks.push(
				(async () => {
					const systemPrompt = `${runtimeConfig.correctionPrompt.systemInstruct} + \n\n + ${runtimeConfig.correctionPrompt.scenarioRequirements}`;
					const completion = await this.ai_client.chat.completions.create({
						model: this.model,
						messages: [
							{ role: 'system', content: systemPrompt },
							{
								role: 'user',
								content: '# CONTEXT\n' + definitionParts.description + '\n\n# INPUT\n' + definitionParts.scenario,
							},
						],
					});
					const completionText = completion.choices?.[0]?.message?.content;
					if (completionText) {
						definitionParts.scenario = completionText;
					}
				})()
			);
		}

		if (definitionParts.alternate_greetings && definitionParts.alternate_greetings.length > 0) {
			tasks.push(
				(async () => {
					const systemPrompt = `${runtimeConfig.correctionPrompt.systemInstruct} + ${runtimeConfig.correctionPrompt.firstMessageRequirements}`;
					definitionParts.alternate_greetings = await Promise.all(
						definitionParts.alternate_greetings!.map(async (greeting) => {
							if (!isFilled(greeting)) return greeting;
							const completion = await this.ai_client.chat.completions.create({
								model: this.model,
								messages: [
									{ role: 'system', content: systemPrompt },
									{
										role: 'user',
										content: '# CONTEXT\n' + definitionParts.description + '\n\n# INPUT\n' + greeting,
									},
								],
							});
							const completionText = completion.choices?.[0]?.message?.content;
							return completionText ?? greeting;
						})
					);
				})()
			);
		}

		await Promise.all(tasks);

		return definitionParts;
	}
}
