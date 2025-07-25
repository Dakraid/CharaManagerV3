// noinspection JSUnusedGlobalSymbols
import type { EventHandlerRequest, H3Event } from 'h3';

export async function authenticate(event: H3Event<EventHandlerRequest>): Promise<string> {
	const _session = await requireUserSession(event);

	if (!_session.user) {
		throw createError({
			statusCode: StatusCode.FORBIDDEN,
			statusMessage: 'User not authenticated.',
		});
	}

	if (!_session.user.id) {
		throw createError({
			statusCode: StatusCode.FORBIDDEN,
			statusMessage: 'User session is invalid. Please try logging in again.',
		});
	}

	return _session.user.id;
}

export async function authenticateOptional(event: H3Event<EventHandlerRequest>): Promise<string | undefined> {
	try {
		const _session = await getUserSession(event);
		return _session.user.id;
	} catch (err: any) {
		return undefined;
	}
}
