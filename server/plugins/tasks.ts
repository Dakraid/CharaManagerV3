export default defineNitroPlugin(async (nitroApp) => {
	console.log('Initializing task system...');

	// Register tasks
	syncTask();

	// Run startup tasks
	await taskManager.runStartupTasks();

	// Setup scheduled tasks
	taskManager.setupScheduledTasks();

	// Cleanup on shutdown
	nitroApp.hooks.hook('close', () => {
		console.log('Shutting down task system...');
		taskManager.stopScheduledTasks();
	});
});
