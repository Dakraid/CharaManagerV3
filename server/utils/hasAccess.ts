import { sql } from 'drizzle-orm';

export default async function hasAccess(characterId: number, userId: string): Promise<boolean> {
	const db = useDrizzle();
	const result = await db.execute(sql<boolean>`SELECT public.has_access(${userId}, ${characterId})`);

	if (result.rows[0]['has_access'] !== true) {
		throw createError({
			statusCode: 401,
			message: 'User has no access to this character.',
		});
	}

	return true;
}
