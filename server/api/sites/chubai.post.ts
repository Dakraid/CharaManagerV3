import type { V2 } from 'character-card-utils';

export default defineEventHandler(async (event) => {
	await authenticate(event);

	const validatedBody = await readValidatedBody(event, (body) => ChubUriSchema.safeParse(body));
	if (!validatedBody.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			statusMessage: validatedBody.error.message,
		});
	}

	const characterPath = validatedBody.data.targetUri.split('/characters/')[1];
	const fileName = 'main_' + characterPath.split('/')[1] + '_spec_v2.png';

	const [creatorName, projectName] = characterPath.split('/');

	try {
		const projectResponse = await fetch(`https://api.chub.ai/api/characters/${creatorName}/${projectName}?full=true`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
			},
		});

		if (!projectResponse.ok) {
			const responseText = await projectResponse.text();
			throw new Error('Failed to fetch character: ' + projectResponse.statusText + ' | ' + responseText + '');
		}

		const metadata = await projectResponse.json();
		const { definition, topics } = metadata.node;

		const characterCard: V2 = {
			data: {
				name: definition.name,
				description: definition.personality,
				personality: definition.tavern_personality,
				scenario: definition.scenario,
				first_mes: definition.first_message,
				mes_example: definition.example_dialogs,
				creator_notes: definition.description,
				system_prompt: definition.system_prompt,
				post_history_instructions: definition.post_history_instructions,
				alternate_greetings: definition.alternate_greetings,
				tags: topics,
				creator: creatorName,
				character_version: '',
				character_book: definition.embedded_lorebook,
				extensions: definition.extensions,
			},
			spec: 'chara_card_v2',
			spec_version: '2.0',
		};

		const characterUrl = metadata.node?.max_res_url;

		if (!characterUrl) {
			throw new Error('Download URL not found in character.');
		}

		const characterResponse = await fetch(characterUrl);

		if (!characterResponse.ok) {
			const responseText = await characterResponse.text();
			throw new Error('Failed to fetch character: ' + characterResponse.statusText + ' | ' + responseText + '');
		}

		const imageBuffer = Buffer.from(await characterResponse.arrayBuffer());
		const imagePng = cleanPNG(imageBuffer);
		const png = embedTextInPng(imagePng, characterCard);
		const blob = new Blob([png], { type: 'image/png' });

		return {
			fileContent: await blobToBase64(blob),
			fileName: fileName,
			fileType: blob.type,
			lastModified: new Date().getTime(),
			origin: validatedBody.data.targetUri,
			public: false,
		};
	} catch (err: any) {
		console.error(err);
		throw createError({
			statusCode: StatusCode.INTERNAL_SERVER_ERROR,
			statusMessage: err.message,
		});
	}
});
