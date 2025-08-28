export async function fileToText(file: File): Promise<string> {
	const buffer = Buffer.from(await file.arrayBuffer());

	const fileData = {
		name: file.name,
		size: file.size,
		type: file.type,
		lastModified: file.lastModified,
		content: `data:${file.type};base64,${buffer.toString('base64')}`,
	};

	return JSON.stringify(fileData);
}

export async function textToFile(textData: string): Promise<File> {
	const fileData = JSON.parse(textData);
	const base64 = fileData.content.split(',')[1];
	const bytes = atob(base64);
	const array = new Uint8Array(bytes.length);
	for (let i = 0; i < bytes.length; i++) {
		array[i] = bytes.charCodeAt(i);
	}

	return new File([array], fileData.name, {
		type: fileData.type,
		lastModified: fileData.lastModified,
	});
}
