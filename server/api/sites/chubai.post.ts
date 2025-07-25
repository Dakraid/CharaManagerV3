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
		const projectResponse = await fetch(`https://api.chub.ai/api/characters/${creatorName}/${projectName}`, {
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

		const characterProject = await projectResponse.json();
		const characterUrl = characterProject.node?.max_res_url;

		if (!characterUrl) {
			throw new Error('Download URL not found in character.');
		}

		const characterResponse = await fetch(characterUrl);

		if (!characterResponse.ok) {
			const responseText = await characterResponse.text();
			throw new Error('Failed to fetch character: ' + characterResponse.statusText + ' | ' + responseText + '');
		}

		const fileType = characterResponse.headers.get('content-type');
		if (fileType !== 'image/png') {
			throw new Error('Invalid file type received.');
		}

		const blob = await characterResponse.blob();

		return {
			fileContent: await blobToBase64(blob),
			fileName: fileName,
			fileType: fileType,
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
