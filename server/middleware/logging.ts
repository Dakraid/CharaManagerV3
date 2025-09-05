export default defineEventHandler((event) => {
	console.log(
		`[${new Date().toISOString()}] New ${event.method} request: ${getRequestURL(event)} by ${getRequestIP(event) ?? 'unknown'} to ${getRequestHost(event)}`
	);
});
