import { eq, notInArray } from 'drizzle-orm';
import fs from 'node:fs/promises';
import encodeChunks from 'png-chunks-encode';
import extractChunks from 'png-chunks-extract';

async function getCompleteImageIds(directoryPath: string): Promise<number[]> {
	try {
		const files = await fs.readdir(directoryPath);
		if (files.length === 0) {
			return [];
		}
		const avifFiles = files.filter((file) => file.endsWith('.avif'));
		const regularFiles = new Set<number>();
		const thumbnailFiles = new Set<number>();

		for (const file of avifFiles) {
			if (file.includes('_thumb.avif')) {
				const id = parseInt(file.replace('_thumb.avif', ''));
				if (!isNaN(id)) {
					thumbnailFiles.add(id);
				}
			} else {
				const id = parseInt(file.replace('.avif', ''));
				if (!isNaN(id)) {
					regularFiles.add(id);
				}
			}
		}

		const completeIds: number[] = [];
		for (const id of regularFiles) {
			if (thumbnailFiles.has(id)) {
				completeIds.push(id);
			}
		}

		return completeIds.sort((a, b) => a - b);
	} catch (error) {
		console.error('Error scanning directory:', error);
		throw error;
	}
}

async function exportImage(character: { id: number; raw: string | null }) {
	try {
		if (!character.raw) {
			return;
		}
		const fileData = JSON.parse(character.raw);
		const base64 = fileData.content.split(',')[1];
		const bytes = atob(base64);
		const array = new Uint8Array(bytes.length);
		for (let i = 0; i < bytes.length; i++) {
			array[i] = bytes.charCodeAt(i);
		}

		const chunks = extractChunks(array);
		const strippedChunks = chunks.filter((c) => c.name !== 'tEXt');
		const encoded = encodeChunks(strippedChunks);

		await saveImageById(character.id, encoded);
	} catch (error: any) {
		console.error(`Error migrating character ${character.id}: ${error.message}`);
	}
}

export default defineTask({
	meta: {
		name: 'images:migrate',
		description: 'Run image migrations',
	},
	async run() {
		console.log('Running images migration task...');

		try {
			const db = useDrizzle();
			const existingFiles = await getCompleteImageIds('./images');

			const missingCharacters = await db
				.select({ id: characters.character_id, raw: originals.file_raw })
				.from(characters)
				.leftJoin(originals, eq(characters.character_id, originals.character_id))
				.where(notInArray(characters.character_id, existingFiles));

			console.log('Found ', missingCharacters.length, ' missing character images. Migrating them now...');

			await Promise.allSettled(missingCharacters.map((character) => exportImage(character)));

			console.log('Finished migrating images.');
			return { result: true };
		} catch (error: any) {
			return { result: false, error: error.message };
		}
	},
});
