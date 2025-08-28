// @ts-check
import eslintConfigPrettier from 'eslint-config-prettier';

import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt()
	.append({
		rules: {
			'vue/no-parsing-error': [
				'error',
				{
					'missing-end-tag-name': false,
					'x-invalid-end-tag': false,
				},
			],
			'vue/no-multiple-template-root': 'off',
			'vue/require-default-prop': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
		},
	})
	.append(eslintConfigPrettier)
	.append({
		ignores: ['**/*.d.ts', '**/*.mjs', 'nuxt.config.ts', '.output/**/*.*', 'app/components/ui/**/*.*', '**/*.png'],
	});
