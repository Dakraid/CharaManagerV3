import { and, eq, or, sql } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);

	if (!config.public.registrationEnabled) {
		throw createError({
			statusCode: StatusCode.FORBIDDEN,
			message: 'Registration is disabled. Please contact the site administrator if you think this is an error.',
		});
	}

	const validatedData = await readValidatedBody(event, (body) => registerSchema.safeParse(body));
	if (!validatedData.success) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			message: validatedData.error.message,
		});
	}

	const user = validatedData.data;
	const db = useDrizzle();

	const existingUser = await db
		.select()
		.from(users)
		.where(or(eq(users.email, user.email.toLowerCase()), eq(users.username, user.username.toLowerCase())));

	if (existingUser.length > 0) {
		throw createError({
			statusCode: StatusCode.BAD_REQUEST,
			message: 'User with this email or username already exists.',
		});
	}

	await db.execute(sql`SELECT public.insert_user(${user.username.toLowerCase()}, ${user.email.toLowerCase()}, ${user.password})`);

	const newUser = await db
		.select()
		.from(users)
		.where(and(eq(users.email, user.email.toLowerCase()), eq(users.username, user.username.toLowerCase())));

	await setUserSession(event, {
		user: {
			id: newUser[0].id,
			email: newUser[0].email,
			username: newUser[0].username,
		},
		loggedInAt: Date.now(),
	});

	return { statusCode: StatusCode.OK, message: 'User registered successfully.' };
});
