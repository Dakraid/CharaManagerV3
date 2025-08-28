export default defineEventHandler(async (event) => {
	let userValid: boolean;

	try {
		const userId = await authenticateOptional(event);
		userValid = userId !== undefined;
	} catch (err: any) {
		userValid = false;
	}

	return { statusCode: userValid ? StatusCode.OK : StatusCode.UNAUTHORIZED, message: 'Session validated.' };
});
