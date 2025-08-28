// noinspection JSUnusedGlobalSymbols
import * as Cards from 'character-card-utils';
import * as z from 'zod/v4';

// Server Responses
export const responseSchema = z.object({
	statusCode: z.number(),
	message: z.string(),
});

export type responseType = z.infer<typeof responseSchema>;

// Character ID
export const idSchema = z.preprocess((val) => {
	if (typeof val === 'string') {
		return Number.parseInt(val);
	}
	return val;
}, z.int());

export const characterIdSchema = z.object({
	id: idSchema,
});

export const visibilityChangeSchema = characterIdSchema.extend({
	public: z.boolean(),
});

export const definitionChangeSchema = characterIdSchema.extend({
	content: z.preprocess((val) => {
		if (typeof val === 'string') {
			return Cards.v2.parse(val);
		}
		return val;
	}, Cards.v2),
});

export const uploadSchema = z.object({
	file: z.file(),
	origin: z.union([z.url().trim(), z.string().includes('local').length(5).trim()]),
	public: z.boolean(),
});

export const listingSchema = z.object({
	perPage: z.number(),
	page: z.number(),
	key: z.string(),
});

export const ChubUriSchema = z.object({
	targetUri: z.union([
		z
			.url()
			.includes('chub.ai')
			.regex(/characters\/[-a-zA-Z0-9@%._+~#=]*\/[-a-zA-Z0-9@%._+~#=]*/),
		z
			.url()
			.includes('characterhub.org')
			.regex(/characters\/[-a-zA-Z0-9@%._+~#=]*\/[-a-zA-Z0-9@%._+~#=]*/),
	]),
});

export const WyvernUriSchema = z.object({
	targetUri: z
		.url()
		.includes('app.wyvern.chat')
		.regex(/characters\/[-a-zA-Z0-9@%._+~#=]*/),
});

export const MultiUriSchema = z
	.string()
	.transform((str) => str.split('\n').filter((line) => line.trim() !== ''))
	.pipe(
		z.array(z.string()).check((ctx) => {
			ctx.value.forEach((uri, index) => {
				const chubResult = ChubUriSchema.safeParse({ targetUri: uri });
				const wyvernResult = WyvernUriSchema.safeParse({ targetUri: uri });

				if (!chubResult.success && !wyvernResult.success) {
					ctx.issues.push({
						code: 'custom',
						message: `URI at line ${index + 1} must be either a chub.ai/characterhub.org or an app.wyvern.chat direct link.`,
						input: uri,
						path: [index],
					});
				}
			});
		})
	);

// User Authentication
// Each schema extends Password to unify the requirements for the password
export const passwordSchema = z.object({
	password: z
		.string()
		.min(8)
		.trim()
		.refine((val) => /[0-9]/.test(val), {
			message: 'Password must contain at least one number',
		})
		.refine((val) => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
			message: 'Password must contain at least one symbol',
		})
		.refine((val) => /[A-Z]/.test(val), {
			message: 'Password must contain at least one uppercase letter',
		})
		.refine((val) => /[a-z]/.test(val), {
			message: 'Password must contain at least one lowercase letter',
		}),
});

export const registerSchema = passwordSchema.extend({
	username: z.string().min(3).trim(),
	email: z.email().trim(),
});

export const loginSchema = passwordSchema.extend({
	login: z.union([z.string().min(3).trim(), z.email().trim()]),
});
