export async function blobToBase64(blob: Blob) {
	const buffer = await blob.arrayBuffer();
	const bytes = new Uint8Array(buffer);
	let binary = '';
	bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
	return btoa(binary);
}

export async function base64ToBlob(base64String: string) {
	const binaryString = atob(base64String);
	const len = binaryString.length;
	const bytes = new Uint8Array(len);

	for (let i = 0; i < len; i++) {
		bytes[i] = binaryString.charCodeAt(i);
	}

	return new Blob([bytes.buffer]);
}
