import type { H3Event } from 'h3';

/**
 * Validates request body using a Zod schema and returns the parsed data
 * @param event - The H3 event object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws createError with BAD_REQUEST status if validation fails
 */
export async function validateRequestBody<T>(event: H3Event, schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } }): Promise<T> {
	const result = await readValidatedBody(event, (body) => schema.safeParse(body));

	if (!result.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			message: result.error.message,
		});
	}

	return result.data!;
}

/**
 * Validates request query using a Zod schema and returns the parsed data
 * @param event - The H3 event object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data
 * @throws createError with BAD_REQUEST status if validation fails
 */
export async function validateRequestQuery<T>(event: H3Event, schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: any } }): Promise<T> {
	const result = await getValidatedQuery(event, (body) => schema.safeParse(body));

	if (!result.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			message: result.error.message,
		});
	}

	return result.data!;
}
