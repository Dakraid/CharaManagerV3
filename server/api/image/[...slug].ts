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
		const data = await loadImageById(id.data);

		// const acceptsEncoding = getHeader(event, 'accept-encoding') || '';
		//
		// if (acceptsEncoding.includes('br')) {
		// 	event.node.res.setHeader('Content-Encoding', 'br');
		// 	data = await brotliCompress(data);
		// } else if (acceptsEncoding.includes('gzip')) {
		// 	event.node.res.setHeader('Content-Encoding', 'gzip');
		// 	data = await gzip(data);
		// } else if (acceptsEncoding.includes('deflate')) {
		// 	event.node.res.setHeader('Content-Encoding', 'deflate');
		// 	data = await deflate(data);
		// }

		event.node.res.setHeader('Content-Type', 'image/png');
		event.node.res.setHeader('Cache-Control', 'public, max-age=3600');
		event.node.res.setHeader('Access-Control-Allow-Origin', '*');
		event.node.res.setHeader('ETag', createHash('md5').update(data).digest('hex'));

		event.node.res.write(data);
	} catch (error: any) {
		throw createError({
			statusCode: StatusCode.NOT_FOUND,
			statusMessage: error.message,
		});
	}
});
