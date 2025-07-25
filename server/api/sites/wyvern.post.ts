import * as Cards from 'character-card-utils';

export default defineEventHandler(async (event) => {
	await authenticate(event);

	const validatedBody = await readValidatedBody(event, (body) => WyvernUriSchema.safeParse(body));
	if (!validatedBody.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			statusMessage: validatedBody.error.message,
		});
	}

	const characterPath = validatedBody.data.targetUri.split('/characters/')[1];
	try {
		const wyvernJson = await $fetch<any>(`https://api.wyvern.chat/characters/${characterPath}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const fileName = 'main_' + wyvernJson.name + '_spec_v2.png';
		const wyvernAvatar = await $fetch(wyvernJson.avatar, {
			method: 'GET',
		});

		let card: Cards.V2;
		try {
			card = Cards.parseToV2(wyvernJson);
		} catch (err: any) {
			throw createError({
				statusCode: StatusCode.BAD_REQUEST,
				statusMessage: 'Failed to parse character definition.',
			});
		}

		if (wyvernAvatar instanceof Blob || wyvernAvatar instanceof File) {
			const newCard = embedTextInPng(await wyvernAvatar.bytes(), card);
			const blob = new Blob([newCard]);

			return {
				fileContent: await blobToBase64(blob),
				fileName: fileName,
				fileType: 'image/png',
				lastModified: new Date().getTime(),
				origin: validatedBody.data.targetUri,
				public: false,
			};
		} else {
			throw new Error('Unrecognized file format received.');
		}
	} catch (err: any) {
		console.error(err);
		throw createError({
			statusCode: StatusCode.INTERNAL_SERVER_ERROR,
			statusMessage: err.message,
		});
	}
});
