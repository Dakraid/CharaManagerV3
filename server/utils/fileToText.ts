export default async function fileToText(file: File): Promise<string> {
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
