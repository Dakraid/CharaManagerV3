export default defineEventHandler(async (event) => {
	const userId = await authenticate(event);

	// Handle FormData instead of JSON
	const formData = await readMultipartFormData(event);
	if (!formData) {
		throw createError({
			statusCode: 400,
			statusMessage: 'No form data provided',
		});
	}

	// Extract file and other fields from FormData
	const fileData = formData.find((field) => field.name === 'file');
	const origin = formData.find((field) => field.name === 'origin')?.data?.toString() || 'local';
	const publicFlag = formData.find((field) => field.name === 'public')?.data?.toString() === 'true';

	if (!fileData) {
		throw createError({
			statusCode: 400,
			statusMessage: 'No file provided',
		});
	}

	// Create a File-like object for your schema
	const file = new File([fileData.data], fileData.filename || 'upload', {
		type: fileData.type || 'application/octet-stream',
	});

	// Validate with your schema
	const request = uploadSchema.safeParse({
		file,
		origin,
		public: publicFlag,
	});

	if (!request.success) {
		throw createError({
			statusCode: 400,
			statusMessage: request.error.message,
		});
	}

	return await useManagerService(userId).put(request.data);
});
