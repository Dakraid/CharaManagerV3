const config = {
	plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
	printWidth: 160,
	tabWidth: 4,
	trailingComma: 'es5',
	semi: true,
	singleQuote: true,
	bracketSameLine: true,
	useTabs: true,
	importOrder: ['^@core/(.*)$', '^@server/(.*)$', '^@ui/(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
	tailwindStylesheet: './app/assets/css/tailwind.css',
};

export default config;
