export default defineEventHandler(async (event) => {
	const taskName = getRouterParam(event, 'name');

	if (!taskName) {
		throw createError({
			statusCode: 400,
			statusMessage: 'Task name is required',
		});
	}

	try {
		// Use event.waitUntil for true fire & forget
		await taskManager.run(taskName, event);

		return {
			success: true,
			message: `Task ${taskName} scheduled`,
		};
	} catch (error: any) {
		throw createError({
			statusCode: 404,
			statusMessage: error.message,
		});
	}
});
