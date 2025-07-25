import { createStorage } from 'unstorage';
import type { Storage as UnstorageStorage } from 'unstorage';
import lruCacheDriver from 'unstorage/drivers/lru-cache';

let storage: UnstorageStorage;

export function useCache() {
	if (!storage) {
		storage = createStorage({
			driver: lruCacheDriver({ ttl: 1000 * 60 * 60 * 3 }),
		});
	}

	return storage;
}

export async function closeCache() {
	if (storage) {
		await storage.dispose();
	}
}
