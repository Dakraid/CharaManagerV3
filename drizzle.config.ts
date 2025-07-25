import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	out: './shared/utils',
	schema: './shared/utils/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
		host: '89.163.151.242',
		user: 'nuxt',
		password: '2y!f!DuByCabYBnPRd9V6su8uu',
		database: 'CharaManagerV3',
		ssl: 'allow',
	},
	verbose: true,
});
