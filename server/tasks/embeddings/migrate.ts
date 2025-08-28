import { eq, isNull } from 'drizzle-orm';

type missingCharacter = {
	id: number;
	content: any;
	description: string | null;
	personality: string | null;
	scenario: string | null;
};

const MAX_REQUESTS_PER_MINUTE = 1000;
const MIN_DELAY_MS = Math.ceil(60000 / MAX_REQUESTS_PER_MINUTE);

async function generateEmbeddings(character: missingCharacter) {
	try {
		const db = useDrizzle();
		let combinedText: string;

		if (character.description) {
			combinedText = [character.description, character.personality || '', character.scenario || ''].filter((text) => text.trim() !== '').join('\n');
		} else {
			combinedText = [character.content.data.description, character.content.data.personality || '', character.content.data.scenario || '']
				.filter((text) => text.trim() !== '')
				.join('\n');
		}

		if (!combinedText.trim()) {
			throw createError({
				statusCode: StatusCode.BAD_REQUEST,
				message: 'Character has no content to generate embeddings from.',
			});
		}

		const embedding = await generateEmbedding(combinedText);
		await db.update(characters).set({ embeddings: embedding }).where(eq(characters.character_id, character.id));
	} catch (err: any) {
		console.error(`Failed to generate embeddings for character ${character.id}`);
		console.error(`${err.message}`);
	}
}

export default defineTask({
	meta: {
		name: 'embeddings:migrate',
		description: 'Run embeddings migrations',
	},
	async run() {
		console.log('Running embeddings migration task...');

		try {
			const db = useDrizzle();

			const missingCharacters = await db
				.select({
					id: characters.character_id,
					content: definitions.content,
					description: definitions.description,
					personality: definitions.personality,
					scenario: definitions.scenario,
				})
				.from(characters)
				.leftJoin(definitions, eq(characters.character_id, definitions.character_id))
				.where(isNull(characters.embeddings));

			console.log('Found ', missingCharacters.length, ' missing character embeddings. Migrating them now...');

			let processed = 0;
			for (const character of missingCharacters) {
				await generateEmbeddings(character);
				processed++;
				if (processed % 100 === 0) {
					console.log(`Migrated ${processed}/${missingCharacters.length} embeddings...`);
				}
				await sleep(MIN_DELAY_MS);
			}

			console.log('Finished migrating embeddings.');
			return { result: true };
		} catch (error: any) {
			return { result: false, error: error.message };
		}
	},
});
