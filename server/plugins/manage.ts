import dayjs from 'dayjs';
import fs from 'node:fs/promises';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';

const manageStorage = createStorage({
	driver: fsDriver({ base: './tmp' }),
});

async function createPathIfNotExists() {
	try {
		await fs.mkdir('./images', { recursive: true });
	} catch (error: any) {
		console.error(`Error creating directory: ${error.message}`);
	}
}

export default defineNitroPlugin(async () => {
	await createPathIfNotExists();

	const lastRun = await manageStorage.getItem<number>('manage:tasks');

	if (lastRun && dayjs(lastRun).add(1, 'hour').unix() > dayjs().unix()) {
		return;
	}

	const p1 = runTask('images:migrate', { payload: {} });
	const p2 = runTask('embeddings:migrate', { payload: {} });
	await Promise.allSettled([p1, p2]);

	await manageStorage.setItem<number>('manage:tasks', dayjs().unix());
});
