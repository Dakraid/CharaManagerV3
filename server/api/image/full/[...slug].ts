// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const id = idSchema.safeParse(event.context.params?.slug);

	if (!id.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			statusMessage: id.error.message,
		});
	}

	try {
		return await serveImageById(event, id.data, false);
	} catch (error: any) {
		throw createError({
			statusCode: StatusCode.NOT_FOUND,
			statusMessage: error.message,
		});
	}
});
