import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './shared/utils',
	schema: './shared/utils/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		url: process.env.NUXT_POSTGRESQL_URL ?? '',
		ssl: 'prefer',
	},
	verbose: true,
});
