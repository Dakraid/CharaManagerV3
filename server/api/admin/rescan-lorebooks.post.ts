import type { V2 } from 'character-card-utils';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const db = useDrizzle();

	await db.delete(character_lorebooks);
	await db.delete(lorebooks);

	const allDefinitions = await db
		.select({
			id: definitions.id,
			character_id: definitions.character_id,
			content: definitions.content,
			owner_id: characters.owner_id,
		})
		.from(definitions)
		.innerJoin(characters, eq(characters.character_id, definitions.character_id));

	const targets = allDefinitions.filter((def) => {
		const content = def.content as V2 | null;
		return content?.data?.character_book;
	});

	let count = 0;
	const total = targets.length;
	const CONCURRENCY_LIMIT = 20;

	for (let i = 0; i < total; i += CONCURRENCY_LIMIT) {
		const chunk = targets.slice(i, i + CONCURRENCY_LIMIT);

		await Promise.all(
			chunk.map(async (def) => {
				try {
					const content = def.content as V2;
					const bookData = content.data!.character_book!;

					const lorebookService = await useLorebookService(def.owner_id);

					try {
						const newBook = await lorebookService.create({
							name: bookData.name || bookData.name !== 'Untitled' ? bookData.name : 'Lorebook of ' + content.data!.name,
							description: bookData.description,
							scan_depth: bookData.scan_depth,
							token_budget: bookData.token_budget,
							recursive_scanning: bookData.recursive_scanning,
							extensions: bookData.extensions || {},
							entries: bookData.entries || [],
						});

						await lorebookService.assignToCharacter(newBook.id, def.character_id);
					} catch (e) {
						console.error(`Failed to extract lorebook for character ${def.character_id}:`, e);
					}
				} catch (e) {
					console.error(`Failed to parse character to V2:`, e);
				}
			})
		);

		count += chunk.length;
		console.log(`Processed ${Math.min(count, total)}/${total} definitions.`);
	}

	return { success: true, processed: count };
});
