import type { V1, V2 } from 'character-card-utils';
import { v1ToV2 } from 'character-card-utils';
import { safeDestr } from 'destr';
import { encode } from 'gpt-tokenizer';
import * as pngText from 'png-chunk-text';
import encodeChunks from 'png-chunks-encode';
import extractChunks from 'png-chunks-extract';

const isV2 = (value: unknown): value is V2 => {
	return !!(
		value &&
		typeof value === 'object' &&
		'spec' in value &&
		(value as any).spec === 'chara_card_v2' &&
		'spec_version' in value &&
		'data' in value &&
		typeof (value as any).data === 'object'
	);
};

const isV1 = (value: unknown): value is V1 => {
	return !!(
		value &&
		typeof value === 'object' &&
		'name' in value &&
		'description' in value &&
		'personality' in value &&
		'scenario' in value &&
		'first_mes' in value &&
		'mes_example' in value &&
		!('spec' in value)
	);
};

function parseDefinition(text: string): V2 {
	let raw: unknown;

	try {
		raw = safeDestr<unknown>(text);
	} catch (err) {
		throw new Error(`Failed to parse JSON: ${(err as Error).message}`);
	}

	if (isV2(raw)) return raw;
	if (isV1(raw)) return v1ToV2(raw);

	throw new Error('Unsupported character definition format.');
}

// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Decoding base64 ⇢ UTF-8
function b64DecodeUnicode(str: string) {
	return decodeURIComponent(
		Array.prototype.map
			.call(atob(str), function (c) {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);
}

// Taken from this answer on StackOverflow: https://stackoverflow.com/a/30106551
// Encoding UTF-8 ⇢ base64
function b64EncodeUnicode(str: string) {
	return btoa(
		encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
			return String.fromCharCode(parseInt(p1, 16));
		})
	);
}

/**
 * Strips embedded character definition from a PNG and returns only the image.
 *
 * @param imageBytes  Raw PNG data
 * @returns           The clean PNG (without the tEXt chunk).
 */
export function cleanPNG(imageBytes: Uint8Array): Uint8Array {
	const chunks = extractChunks(imageBytes);

	let foundText: string | null = null;

	for (const c of chunks) {
		if (c.name !== 'tEXt') continue;
		const { keyword, text } = pngText.decode(c.data);
		if (keyword.toLowerCase() === 'chara') {
			foundText = b64DecodeUnicode(text);
			break;
		}
	}

	if (!foundText?.length) {
		return imageBytes;
	}

	const definition = parseDefinition(foundText);

	// Legacy clean-up for numeric positions
	if (definition.data.character_book?.entries) {
		definition.data.character_book.entries.forEach((entry: any) => {
			if (entry.position !== 'before_char' && entry.position !== 'after_char') {
				entry.position = entry.position === 0 ? 'before_char' : 'after_char';
			}
		});
	}

	const strippedChunks = chunks.filter((c) => c.name !== 'tEXt');
	return encodeChunks(strippedChunks);
}

/**
 * Extracts the embedded character definition from a PNG and strips it out.
 *
 * @param imageBytes  Raw PNG data
 * @returns           A new PNG (without the tEXt chunk) and the parsed definition.
 */
export function extractTextAndStripPng(imageBytes: Uint8Array): { png: Uint8Array; definition: V2 } {
	const chunks = extractChunks(imageBytes);

	let foundText: string | null = null;

	for (const c of chunks) {
		if (c.name !== 'tEXt') continue;
		const { keyword, text } = pngText.decode(c.data);
		if (keyword.toLowerCase() === 'chara') {
			foundText = b64DecodeUnicode(text);
			break;
		}
	}

	if (!foundText?.length) {
		throw new Error('No character definition found in PNG.');
	}

	const definition = parseDefinition(foundText);

	// Legacy clean-up for numeric positions
	if (definition.data.character_book?.entries) {
		definition.data.character_book.entries.forEach((entry: any) => {
			if (entry.position !== 'before_char' && entry.position !== 'after_char') {
				entry.position = entry.position === 0 ? 'before_char' : 'after_char';
			}
		});
	}

	const strippedChunks = chunks.filter((c) => c.name !== 'tEXt');
	const encoded = encodeChunks(strippedChunks); // Uint8Array
	return { png: encoded, definition };
}

/**
 * Embeds a character definition in a PNG (overwriting any existing one).
 *
 * @param imageBytes  Raw PNG data
 * @param definition  Character definition (V2)
 * @returns           PNG with embedded definition.
 */
export function embedTextInPng(imageBytes: Uint8Array, definition: V2): Uint8Array {
	const chunks = extractChunks(imageBytes);

	// Remove any existing tEXt chunks
	const baseChunks = chunks.filter((c) => c.name !== 'tEXt');

	// Insert our new tEXt chunk before the IEND chunk (last)
	const encodedText = b64EncodeUnicode(JSON.stringify(definition));
	const newTextChunk = pngText.encode('chara', encodedText);
	baseChunks.splice(-1, 0, newTextChunk);

	return encodeChunks(baseChunks); // Uint8Array
}

export function countTokens(definition: V2): { total: number; perma: number } {
	const permanentString = definition.data.description + definition.data.personality + definition.data.scenario;
	const totalString = permanentString + definition.data.first_mes;
	const permaTokens = encode(permanentString).length;
	const totalTokens = encode(totalString).length;
	return { total: totalTokens, perma: permaTokens };
}
