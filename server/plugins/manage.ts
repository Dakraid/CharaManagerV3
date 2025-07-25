import fs from 'node:fs/promises';

async function createPathIfNotExists() {
	const runtimeConfig = useRuntimeConfig();

	try {
		await fs.mkdir(runtimeConfig.imageFolder, { recursive: true });
	} catch (error: any) {
		console.error(`Error creating directory: ${error.message}`);
	}
}

export default defineNitroPlugin(async (nitroApp) => {
	await createPathIfNotExists();

	nitroApp.hooks.hookOnce('close', async () => {
		console.log('Server shutting down, performing cleanup...');
		await closeDrizzle();
		await closeCache();
		console.log('Cleanup done!');
	});
});
