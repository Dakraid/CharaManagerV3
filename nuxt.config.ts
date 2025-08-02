import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
// noinspection JSUnusedGlobalSymbols
export default defineNuxtConfig({
	compatibilityDate: '2025-07-27',
	app: {
		head: {
			htmlAttrs: {
				lang: 'en',
			},
			title: 'CharaManagerV3',
			charset: 'utf-8',
			viewport: 'width=device-width, initial-scale=1',
			meta: [{ name: 'description', content: 'An application to manage your TavernV2 cards.' }],
		},
		pageTransition: {
			name: 'page',
			mode: 'out-in',
		},
	},
	devtools: { enabled: true },
	sourcemap: true,
	modules: [
		'@nuxt/eslint',
		'@nuxt/icon',
		'@nuxt/image',
		'@nuxt/scripts',
		'shadcn-nuxt',
		'@nuxtjs/color-mode',
		'@nuxtjs/robots',
		'dayjs-nuxt',
		'@pinia/nuxt',
		'pinia-plugin-persistedstate/nuxt',
		'nuxt-auth-utils',
	],
	css: ['./app/assets/css/tailwind.css'],
	vite: {
		plugins: [tailwindcss()],
	},
	nitro: {
		compressPublicAssets: {
			gzip: true,
			brotli: true,
		},
	},
	experimental: {
		asyncContext: true,
		buildCache: true,
	},
	shadcn: {
		prefix: '',
		componentDir: './app/components/ui',
	},
	colorMode: {
		classSuffix: '',
	},
	robots: {
		blockNonSeoBots: true,
		blockAiBots: true,
	},
	dayjs: {
		locales: ['en', 'de'],
		plugins: ['relativeTime', 'utc', 'timezone', 'localizedFormat'],
		defaultLocale: 'en',
		defaultTimezone: 'Europe/Berlin',
	},
	runtimeConfig: {
		// PostgreSQL Database
		postgresqlURL: '', // postgresql://<PG_USER>:<PG_PASSWORD>@<PG_HOST>:<PG_PORT>/<PG_DATABASE>
		// Image Storage
		imageFolder: './images',
		// Caching
		ttl: 1000 * 60 * 60 * 24, // In milliseconds, default 24 Hours
		redisURL: '', // optional, redis://<REDIS_USER>:<REDIS_PASSWORD>@<REDIS_HOST>:<REDIS_PORT>
		public: {
			debug: false,
			imageDomain: '',
			thumbnailWidth: 256,
			thumbnailHeight: 384,
			registrationEnabled: false,
			batchSize: 20,
		},
	},
});
