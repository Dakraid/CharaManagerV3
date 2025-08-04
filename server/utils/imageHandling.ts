import type { H3Event } from 'h3';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';
import sharp from 'sharp';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);

export async function serveImageById(event: H3Event, id: number, thumbnail: boolean): Promise<Blob> {
	let data = await loadImageById(id, thumbnail);

	const acceptsEncoding = getHeader(event, 'accept-encoding') || '';

	if (acceptsEncoding.includes('br')) {
		setHeader(event, 'Content-Encoding', 'br');
		data = await brotliCompress(data);
	} else if (acceptsEncoding.includes('gzip')) {
		setHeader(event, 'Content-Encoding', 'gzip');
		data = await gzip(data);
	} else if (acceptsEncoding.includes('deflate')) {
		setHeader(event, 'Content-Encoding', 'deflate');
		data = await deflate(data);
	}

	setHeader(event, 'Content-Type', 'image/png');
	setHeader(event, 'Cache-Control', 'public, max-age=3600');
	setHeader(event, 'Access-Control-Allow-Origin', '*');
	setHeader(event, 'ETag', createHash('md5').update(data).digest('hex'));

	return new Blob([data], { type: 'image/avif' });
}

export async function loadImageById(id: number, thumbnail: boolean = false): Promise<Uint8Array> {
	try {
		const value = await useCache().getItemRaw<Uint8Array>(`${id}${thumbnail ? '_thumb' : ''}`);
		if (value) {
			return value;
		}

		const file = await fs.readFile(path.join('./images', `${id}${thumbnail ? '_thumb.avif' : '.avif'}`));
		await useCache().setItemRaw(`${id}${thumbnail ? '_thumb' : ''}`, file);

		return file;
	} catch (error: any) {
		throw new Error(`Failed to load image from file system: ${error.message}`);
	}
}

export async function saveImageById(id: number, data: Uint8Array): Promise<void> {
	const runtimeConfig = useRuntimeConfig();
	try {
		const imageFull = await sharp(data)
			.avif({ quality: runtimeConfig.originalQuality ?? 90 })
			.toBuffer();
		const imageThumb = await sharp(data)
			.resize({ width: 256, height: 384 })
			.avif({ quality: runtimeConfig.thumbnailQuality ?? 70 })
			.toBuffer();

		await fs.writeFile(path.join('./images', `${id}.avif`), imageFull);
		await useCache().setItemRaw(`${id}`, imageFull);

		await fs.writeFile(path.join('./images', `${id}_thumb.avif`), imageThumb);
		await useCache().setItemRaw(`${id}_thumb`, imageThumb);
	} catch (error: any) {
		throw new Error(`Failed to save images to file system: ${error.message}`);
	}
}

export async function deleteImageById(id: number): Promise<void> {
	try {
		await fs.unlink(path.join('./images', `${id}.avif`));
		await fs.unlink(path.join('./images', `${id}_thumb.avif`));
	} catch (error: any) {
		throw new Error(`Failed to delete images from file system: ${error.message}`);
	}
}
