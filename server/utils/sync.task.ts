/* eslint-disable @typescript-eslint/no-require-imports */
// noinspection ES6ConvertRequireIntoImport
import { characters, originals } from '#shared/utils/schema';
import { eq, notInArray } from 'drizzle-orm';

const scanFilesWorker = async (workerData: any) => {
	const fs = require('node:fs/promises');
	const path = require('node:path');

	try {
		const fileList = await fs.readdir(workerData.imageFolder);
		const files = fileList
			.map((file: string) => {
				return parseInt(path.parse(file).name);
			})
			.filter((id: number) => !isNaN(id));

		return { success: true, files };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

const processImagesWorker = async (workerData: any) => {
	const fs = require('node:fs/promises');
	const path = require('node:path');
	const extractChunks = require('png-chunks-extract');
	const encodeChunks = require('png-chunks-encode');

	const { characters, imageFolder } = workerData;
	const results = [];

	for (const character of characters) {
		try {
			if (!character.raw) {
				continue;
			}
			const fileData = JSON.parse(character.raw);
			const base64 = fileData.content.split(',')[1];
			const bytes = atob(base64);
			const array = new Uint8Array(bytes.length);
			for (let i = 0; i < bytes.length; i++) {
				array[i] = bytes.charCodeAt(i);
			}

			const charFile = new File([array], fileData.name, {
				type: fileData.type,
				lastModified: fileData.lastModified,
			});

			const chunks = extractChunks(await charFile.bytes());
			const strippedChunks = chunks.filter((c: any) => c.name !== 'tEXt');
			const encoded = encodeChunks(strippedChunks);
			const imagePath = path.join(imageFolder, `${character.id}.png`);

			await fs.writeFile(imagePath, encoded);

			results.push({
				id: character.id,
				success: true,
			});
		} catch (error: any) {
			results.push({
				id: character.id,
				success: false,
				error: error.message,
			});
		}
	}

	return { success: true, results };
};

export const syncTask = () =>
	taskManager.register({
		name: 'sync-data',
		runAtStartup: true,
		schedule: '*/30 * * * *', // Every 30 minutes
		handler: async () => {
			console.log('Running sync-data task...');
			const runtimeConfig = useRuntimeConfig();
			const db = useDrizzle();

			try {
				const scanWorkerCode = workerTaskManager.createWorkerCode(scanFilesWorker);
				const fileResult = await workerTaskManager.runWorker(scanWorkerCode, { imageFolder: runtimeConfig.imageFolder });

				if (!fileResult.success) {
					throw new Error(fileResult.error);
				}

				const files = fileResult.files;
				console.log('Found', files.length, 'files in image folder.');

				const missingCharacters = await db
					.select({ id: characters.character_id, raw: originals.file_raw })
					.from(characters)
					.leftJoin(originals, eq(characters.character_id, originals.character_id))
					.where(notInArray(characters.character_id, files));

				console.log('Found', missingCharacters.length, 'missing character images.');

				const batchSize = 10;
				const processWorkerCode = workerTaskManager.createWorkerCode(processImagesWorker);
				for (let i = 0; i < missingCharacters.length; i += batchSize) {
					const batch = missingCharacters.slice(i, i + batchSize);

					const result = await workerTaskManager.runWorker(processWorkerCode, {
						characters: batch,
						imageFolder: runtimeConfig.imageFolder,
					});

					if (!result.success) {
						console.error('Batch processing failed:', result);
					}
				}

				console.log('Completed sync-data task.');
			} catch (error) {
				console.error('Error in sync-data task:', error);
				throw error;
			}
		},
	});
