import fs from 'node:fs/promises';
import path from 'node:path';

const runtimeConfig = useRuntimeConfig();

export async function loadImageById(id: number): Promise<Uint8Array> {
	try {
		const value = await useCache().getItemRaw<Uint8Array>(id.toString());
		if (value) {
			return value;
		}

		const file = await fs.readFile(path.join(runtimeConfig.imageFolder, `${id}.png`));
		await useCache().setItemRaw(id.toString(), file);

		return file;
	} catch (error: any) {
		throw new Error(`Failed to load image to file system: ${error.message}`);
	}
}

export async function saveImageById(id: number, data: Uint8Array): Promise<void> {
	try {
		await fs.writeFile(path.join(runtimeConfig.imageFolder, `${id}.png`), data);
		await useCache().setItemRaw(id.toString(), data);
	} catch (error: any) {
		throw new Error(`Failed to save image to file system: ${error.message}`);
	}
}

export async function deleteImageById(id: number): Promise<void> {
	try {
		await fs.unlink(path.join(runtimeConfig.imageFolder, `${id}.png`));
	} catch (error: any) {
		throw new Error(`Failed to save image to file system: ${error.message}`);
	}
}
