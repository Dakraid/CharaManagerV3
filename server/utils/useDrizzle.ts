import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const runtimeConfig = useRuntimeConfig();

let pool: Pool;
let db: ReturnType<typeof drizzle>;

export function useDrizzle() {
	if (!pool) {
		if (!runtimeConfig.postgresqlURL) {
			throw new Error('DATABASE_URL environment variable is not set');
		}

		pool = new Pool({
			connectionString: runtimeConfig.postgresqlURL,
			max: 500,
			idleTimeoutMillis: 300000,
			connectionTimeoutMillis: 20000,
			ssl: false,
		});

		db = drizzle({ client: pool });
	}

	if (!db) {
		db = drizzle({ client: pool });
	}

	return db;
}
