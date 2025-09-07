import dayjs from 'dayjs';
import fs from 'node:fs/promises';
import { createStorage } from 'unstorage';
import fsDriver from 'unstorage/drivers/fs';

const manageStorage = createStorage({
	driver: fsDriver({ base: './tmp' }),
});

export default defineNitroPlugin(async () => {
	const lastRun = await manageStorage.getItem<number>('manage:tasks');

	if (lastRun && dayjs(lastRun).add(1, 'hour').unix() > dayjs().unix()) {
		return;
	}

	try {
		await fs.mkdir('./images', { recursive: true });
	} catch (error: any) {
		console.error(`Error creating directory: ${error.message}`);
	}

	const p1 = runTask('images:migrate', { payload: {} });
	const p2 = runTask('embeddings:migrate', { payload: {} });

	Promise.allSettled([p1, p2])
		.then(async () => {
			await manageStorage.setItem<number>('manage:tasks', dayjs().unix());
		})
		.catch((err) => {
			console.error('Background tasks error:', err);
		});
});
