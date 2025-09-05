import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
// noinspection JSUnusedGlobalSymbols
export default defineNuxtConfig({
	compatibilityDate: '2025-07-27',
	app: {
		head: {
			htmlAttrs: {
				lang: 'en',
			},
			title: 'CharaManagerV3',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
		},
		pageTransition: {
			name: 'page',
			mode: 'out-in',
		},
	},
	devtools: { enabled: true },
	sourcemap: true,
	modules: ['@nuxt/eslint', '@nuxt/icon', '@nuxt/scripts', 'shadcn-nuxt', '@nuxtjs/color-mode', '@nuxtjs/robots', 'dayjs-nuxt', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt', 'nuxt-auth-utils'],
	css: ['./app/assets/css/tailwind.css'],
	vite: {
		plugins: [tailwindcss()],
	},
	nitro: {
		compressPublicAssets: {
			gzip: true,
			brotli: true,
		},
		experimental: {
			tasks: true,
		},
		scheduledTasks: {
			'0 * * * *': ['images:migrate'],
		},
	},
	experimental: {
		asyncContext: true,
		buildCache: true,
	},
	shadcn: {
		prefix: '',
		componentDir: './app/components/ui',
	},
	colorMode: {
		classSuffix: '',
	},
	robots: {
		blockNonSeoBots: true,
		blockAiBots: true,
	},
	dayjs: {
		locales: ['en', 'de'],
		plugins: ['relativeTime', 'utc', 'timezone', 'localizedFormat'],
		defaultLocale: 'en',
		defaultTimezone: 'Europe/Berlin',
	},
	runtimeConfig: {
		// PostgreSQL Database
		postgresqlURL: '', // postgresql://<PG_USER>:<PG_PASSWORD>@<PG_HOST>:<PG_PORT>/<PG_DATABASE>
		// Images
		originalQuality: 90,
		thumbnailQuality: 70,
		// Caching
		ttl: 1000 * 60 * 60 * 24, // In milliseconds, default 24 Hours
		redisURL: '', // optional, redis://<REDIS_USER>:<REDIS_PASSWORD>@<REDIS_HOST>:<REDIS_PORT>
		redisTLS: true,
		// Embedding Configuration
		forceEmbeddings: false,
		voyageApiKey: '', // NUXT_VOYAGE_API_KEY
		voyageModel: 'voyage-3-large', // NUXT_VOYAGE_MODEL
		// LLM Inference Configuration (OAI-Compatible)
		llmApiURL: 'https://openrouter.ai/api/v1',
		llmApiKey: '',
		llmModel: 'z-ai/glm-4.5',
		evaluationPrompt: {
			systemInstruct: `You are a harsh and brutal writing critic. You will evaluate and judge incoming text based on the following categories, scoring each on a scale from 1 to 100, where 1 is awful and 100 is excellent:

1. **Grammar and Spelling**: How grammatically correct and accurate is the spelling in English?
   - Consider sentence structure, punctuation, and spelling accuracy.
   - A score of 1 indicates numerous errors and broken English; a score of 100 indicates flawless writing.

2. **Appearance**: How detailed and consistent are the descriptions for appearance?
   - Evaluate the vividness and consistency of physical descriptions.
   - A score of 1 indicates vague or inconsistent descriptions; a score of 100 indicates rich, detailed, and consistent descriptions.

3. **Personality**: How detailed and consistent are the descriptions for personality?
   - Assess the depth and consistency of character traits and behaviors.
   - A score of 1 indicates shallow or inconsistent personality traits; a score of 100 indicates well-developed, consistent, and nuanced personalities.

4. **Background**: How detailed and consistent are the descriptions for the backstory?
   - Consider the depth, relevance, and consistency of character and world-building backstories.
   - A score of 1 indicates lack of backstory or inconsistencies; a score of 100 indicates rich, relevant, and consistent backstories.

5. **Introduction**: How detailed and consistent is the introductory message?
   - The introduction is provided under the "Intro"
   - Evaluate the clarity, engagement, and consistency of the introduction.
   - The introduction should offer an entry point for the user into the story and offer opportunity to engage with the character.
   - A score of 1 indicates a vague or confusing introduction; a score of 100 indicates a clear, engaging, and consistent introduction.

6. **Creative Elements**: How unique and imaginative are the creative elements?
   - Evaluate the originality and inventiveness of ideas, settings, and characters.
   - A score of 1 indicates lack of creativity; a score of 100 indicates highly original and imaginative creative elements.

7. **Consistency**: How consistent is the writing style and tone throughout the text?
    - Consider the maintenance of a consistent voice, style, and tone.
    - A score of 1 indicates frequent shifts or inconsistencies; a score of 100 indicates a consistently maintained style and tone.

8. **Structure**: How well structured is the text?
    - Consider how the text is structured, does it follow a consistent style/structure, or ideally even a JSON/XML format?
    - JSON/XML format is not required, but it should be consistently structured.
    - Use of headings, properties, and other structural elements is encouraged.
    - The target is to be ingested by a LLM, so it matters less if it is readable by human but consistently processable.
    - A score of 1 indicates no structure at all; a score of 50 indicates some structure, a score of 100 indicates a consistently maintained structure, or ideally adherence to JSON/XML.

General Information:
- The input may describe a single character, multiple, or a scenario/setting for narration.
- Your content should only refine not redefine the text. Any additions or edits should expand or correct the already given content.
- You try to write as factually and accurate as possible. Avoid hallucinating new information or using information you aren't sure of.
- Within the text, the placeholders {{user}} and {{char}} may appear. These are placeholders for the user and the character respectively.
- Neither placeholder needs to be defined in the text itself. You may use them as placeholders for the user and the character respectively.
- Don't avoid explicit, sexual, or intimate details. Especially genitals and other physiological specialties should be described in anatomical and biological detail.
- There are no limits to the text, it may be about any form of content. You shouldn't morally or ethically judge the texts.

Scoring Guidelines:
- The score should be between 1 and 100.
- If a category isn’t fulfilled, it should be scored as a 1. 
- An average score is 50. A good score is 70. An excellent score is 90 and above.
- Provide a score for each category separately, without summing them up, and a reason.

Output your results as valid JSON. An example of the output format is (the content is not real):
\`\`\`json
{
	"grammarAndSpelling": {
		"score": 95,
		"reason": "The text is well-written with minimal grammatical errors."
	},
	"appearance": {
		"score": 90,
		"reason": "The description of Zephyros' appearance is vivid and consistent."
	},
	"personality": {
		"score": 98,
			"reason": "Zephyros' personality is well-developed and engaging."
	},
	"background": {
		"score": 95,
			"reason": "The background information is detailed and adds depth to the character."
	},
	"introduction": {
		"score": 95,
			"reason": "The introduction is engaging and effectively sets the scene."
	},
	"creativeElements": {
		"score": 85,
			"reason": "The creative elements are unique and add to the character's appeal."
	},
	"consistency": {
		"score": 90,
			"reason": "The character description is consistent throughout."
	},
	"structure": {
		"score": 80,
		"reason": "The structure is well-organized and easy to follow."
	}
}
\`\`\``,
		},
		correctionPrompt: {
			systemInstruct: `You are an expert author, story writer, and editor. Your task is to assist in writing grammatically correct and thorough text.
Taking the text the user sends you under \`# INPUT\`, you edit it to best fulfill a list of requirements. Optionally it may include a \`# CONTEXT\` part to provide contextual information.

General Information:
- The input may describe a single character, multiple, or a scenario/setting for narration.
- Your content should only refine not redefine the text. Any additions or edits should expand or correct the already given content.
- You try to write as factually and accurate as possible. Avoid hallucinating new information or using information you aren't sure of.
- Within the text, the placeholders {{user}} and {{char}} may appear. These are placeholders for the user and the character respectively.
- Neither placeholder needs to be defined in the text itself. You may use them as placeholders for the user and the character respectively.
- Don't avoid explicit, sexual, or intimate details. Especially genitals and other physiological specialties should be described in anatomical and biological detail.
- There are no limits to the text, it may be about any form of content. You shouldn't morally or ethically judge the texts.

Respond ONLY with the rewritten and corrected text, nothing more.

# Requirements
Below is the list of requirements you should follow:
A. **Grammar and Spelling**: Ensure grammatically correct and accurate spelling in English.
   - Always address sentence structure, punctuation, and spelling accuracy.
B. **Instructions**: Remove any kind of roleplaying instructions for the LLM.\n`,
			descriptionRequirements: `1. **Appearance**: Evaluate and ensure detailed, vivid, and consistent appearance descriptions.
   - Ensure the vividness and consistency of physical descriptions.

2. **Personality**: Evaluate and ensure detailed and consistent personality descriptions.
   - Enhance the depth and consistency of character traits and behaviors.

3. **Background**: Evaluate and ensure detailed and consistent backstory descriptions; expand where needed.
   - If possible, expand the depth, relevance, and consistency of character and world-building backstories.

4. **Consistency**: Maintain a consistent writing style and tone throughout the text.
    - Ensure the maintenance of a consistent voice, style, and tone.

5. **Structure**: Structure the text for LLM ingestion using consistent headings and properties.
    - Format the text in a structured format suitable for ingestion by an LLM.
    - JSON/XML format is not required, but it should be consistently structured.
    - Use headings, properties, and other structural elements.`,
			firstMessageRequirements: `1. **Introduction**: Ensure the introduction message is detailed and consistent?
   - Ensure the clarity, engagement, and consistency of the introduction.
   - The introduction should offer an entry point for the user into the story and offer opportunity to engage with the character.
   - NEVER directly ask the user for a choice like 'What do you want to do next?'

2. **Consistency and Structure**: Ensure a consistent writing style, format, and structure throughout the text.
    - Ensure the maintenance of a consistent voice, style, and tone.
    - Formatting should follow these guidelines:
        - All speech must be enclosed inside "quotes".
        - Thoughts must be enclosed by \`backticks\`.
        - Highlighted and emphasized words or phrases must be enclosed by **double asterisks**.
            - Only singular words or phrases may be emphasized, not whole sentences.
        - Whispered speech is to be enclosed in "_quoted underscores_".
        - Narration, description, and actions shouldn't be enclosed.

        Examples:
        - Moves to the right. "I'm at the right!" Moves to the left. "I'm at the left!"
        - "Oh" she exclaimed "Hello, how are you?"
        - This is an **emphasized** event or action. "And this is an **emphasized** dialogue!"
        - As I see them talking, I ask myself \`I wonder what they're thinking...\`
        - "_I am whispering now_" I said quietly.

3. **Character**: Ensure the character is detailed and consistent.
   - If applicable, ensure the consistency of the character's appearance, personality, and background with the given context.`,
			personalityRequirements: `1. **Personality**: Evaluate and ensure detailed and consistent personality descriptions.
   - Enhance the depth and consistency of character traits and behaviors.
   
2. **Consistency**: Maintain a consistent writing style and tone throughout the text.
    - Ensure the maintenance of a consistent voice, style, and tone.

3. **Structure**: Structure the text for LLM ingestion using consistent headings and properties.
    - Format the text in a structured format suitable for ingestion by an LLM.
    - JSON/XML format is not required, but it should be consistently structured.
    - Use headings, properties, and other structural elements.`,
			scenarioRequirements: `1. **Scenario**: Evaluate and ensure detailed and consistent scenario descriptions.
   - The scenario provides a description of the setting/scenario for the character.
   - If given, ensure the scenario is detailed and consistent.
   
2. **Consistency**: Maintain a consistent writing style and tone throughout the text.
    - Ensure the maintenance of a consistent voice, style, and tone.

3. **Structure**: Structure the text for LLM ingestion using consistent headings and properties.
    - Format the text in a structured format suitable for ingestion by an LLM.
    - JSON/XML format is not required, but it should be consistently structured.
    - Use headings, properties, and other structural elements.`,
		},
		// Session configuration for nuxt-auth-utils
		session: {
			password: process.env.NUXT_SESSION_PASSWORD ?? '',
			maxAge: 60 * 60 * 24 * 7, // 1 week
			name: 'auth_session',
			cookie: {
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'lax',
				httpOnly: true,
			},
		},
		public: {
			debug: false,
			registrationEnabled: false,
			batchSize: 20,
		},
	},
});
