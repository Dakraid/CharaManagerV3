import { createHash } from 'node:crypto';
import { promisify } from 'node:util';
import * as zlib from 'node:zlib';

const brotliCompress = promisify(zlib.brotliCompress);
const gzip = promisify(zlib.gzip);
const deflate = promisify(zlib.deflate);

// noinspection JSUnusedGlobalSymbols
export default defineEventHandler(async (event) => {
	const id = idSchema.safeParse(event.context.params?.slug);

	if (!id.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			statusMessage: id.error.message,
		});
	}

	try {
		let data = await loadImageById(id.data);

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

		// Convert Uint8Array to Blob and return it
		return new Blob([data], { type: 'image/png' });
	} catch (error: any) {
		throw createError({
			statusCode: StatusCode.NOT_FOUND,
			statusMessage: error.message,
		});
	}
});
