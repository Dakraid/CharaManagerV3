export function createServicePool<A extends any[], S, K extends KeyOf<A>>(opts: CreateServicePoolOptions<A, S, K>) {
	const { keyFromArgs, factory, ttlMs, onDispose, name = 'service' } = opts;

	const active = new Map<K, ServiceEntry<S>>();
	const pending = new Map<K, Promise<S>>(); // Prevents duplicate concurrent creations

	function scheduleDispose(key: K) {
		const entry = active.get(key);
		if (!entry) return;
		if (entry.timer) clearTimeout(entry.timer);

		entry.timer = setTimeout(async () => {
			try {
				if (onDispose) {
					await onDispose(entry.service, key);
				}
			} finally {
				active.delete(key);
			}
		}, ttlMs);
	}

	async function getOrCreate(...args: A): Promise<S> {
		const key = keyFromArgs(...args);

		// Fast path: already created
		const existing = active.get(key);
		if (existing) {
			scheduleDispose(key);
			// Optional: verbose log
			// console.log(`Getting ${name} for key=${String(key)} (active: ${active.size})`);
			return existing.service;
		}

		// If a creation is already in-flight, await it
		const inFlight = pending.get(key);
		if (inFlight) {
			const service = await inFlight;
			scheduleDispose(key);
			return service;
		}

		// Create new
		const creation = (async () => {
			// Optional: verbose log
			// console.log(`Creating new ${name} for key=${String(key)}...`);
			const service = await factory(...args);
			active.set(key, { service, timer: undefined });
			scheduleDispose(key);
			return service;
		})();

		pending.set(key, creation);

		try {
			return await creation;
		} finally {
			pending.delete(key);
		}
	}

	function size() {
		return active.size;
	}

	async function disposeNow(key: K) {
		const entry = active.get(key);
		if (!entry) return false;
		if (entry.timer) clearTimeout(entry.timer);
		if (onDispose) await onDispose(entry.service, key);
		return active.delete(key);
	}

	async function disposeAll() {
		const keys = Array.from(active.keys());
		for (const key of keys) {
			await disposeNow(key);
		}
	}

	return {
		useService: (...args: A) => getOrCreate(...args),
		disposeNow,
		disposeAll,
		size,
	};
}
