// noinspection JSUnusedGlobalSymbols
import * as z from 'zod/v4';

// Server Responses
export const responseSchema = z.object({
	statusCode: z.number(),
	message: z.string(),
});

export type responseType = z.infer<typeof responseSchema>;

// Evaluations
export const scoreSchema = z.object({
	score: z.number().min(0).max(100),
	reason: z.string(),
});

export const evaluationSchema = z.object({
	grammarAndSpelling: scoreSchema,
	appearance: scoreSchema,
	personality: scoreSchema,
	background: scoreSchema,
	introduction: scoreSchema,
	creativeElements: scoreSchema,
	consistency: scoreSchema,
	structure: scoreSchema,
});

export type Evaluation = z.infer<typeof evaluationSchema>;

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

export const definitionLLMSchema = z.object({
	description: z.string(),
	first_mes: z.string().optional(),
	personality: z.string().optional(),
	scenario: z.string().optional(),
	alternate_greetings: z.array(z.string()).optional(),
});

export const visibilityChangeSchema = characterIdSchema.extend({
	public: z.boolean(),
});

export const definitionChangeSchema = characterIdSchema.extend({
	content: z.any(),
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

// Remote Card Fetching
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
