export default defineEventHandler(() => {
	// Return list of registered tasks
	const tasks = Array.from(taskManager['tasks'].values()).map((task) => ({
		name: task.name,
		schedule: task.schedule,
		runAtStartup: task.runAtStartup,
	}));

	return { tasks };
});
