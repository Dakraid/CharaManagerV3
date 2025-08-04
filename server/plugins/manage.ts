import fs from 'node:fs/promises';

async function createPathIfNotExists() {
	try {
		await fs.mkdir('./images', { recursive: true });
	} catch (error: any) {
		console.error(`Error creating directory: ${error.message}`);
	}
}

export default defineNitroPlugin(async () => {
	await createPathIfNotExists();
});
