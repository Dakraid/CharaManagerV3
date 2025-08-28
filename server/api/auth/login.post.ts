import { eq, or, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const validatedData = await readValidatedBody(event, (body) => loginSchema.safeParse(body));
	if (!validatedData.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			message: validatedData.error.message,
		});
	}

	const user = validatedData.data;
	const db = useDrizzle();

	const existingUsers = await db
		.select()
		.from(users)
		.where(or(eq(users.email, user.login.toLowerCase()), eq(users.username, user.login.toLowerCase())));

	if (existingUsers.length === 0) {
		throw createError({
			statusCode: 401,
			message: 'Invalid email, username, or password.',
		});
	}

	const isPasswordValid = await db.execute(sql<boolean>`SELECT public.verify_password(${user.login}, ${user.password})`);

	if (isPasswordValid.rows[0]['verify_password'] !== true) {
		throw createError({
			statusCode: 401,
			message: 'Invalid email, username, or password.',
		});
	}

	await setUserSession(event, {
		user: {
			id: existingUsers[0].id,
			email: existingUsers[0].email,
			username: existingUsers[0].username,
		},
		loggedInAt: Date.now(),
	});

	return { statusCode: StatusCode.OK, message: 'Login successful' };
});
