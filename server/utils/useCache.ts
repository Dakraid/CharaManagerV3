import { createStorage } from 'unstorage';
import type { Storage as UnstorageStorage } from 'unstorage';
import lruCacheDriver from 'unstorage/drivers/lru-cache';
import redisDriver from 'unstorage/drivers/redis';

const runtimeConfig = useRuntimeConfig();

let storage: UnstorageStorage;

export function useCache() {
	if (!storage) {
		if (runtimeConfig.redisURL.startsWith('redis://')) {
			storage = createStorage({
				driver: redisDriver({
					base: 'CMV3',
					url: runtimeConfig.redisURL,
					tls: runtimeConfig.redisTLS as any,
					ttl: runtimeConfig.ttl / 1000,
				}),
			});
		} else {
			storage = createStorage({
				driver: lruCacheDriver({ ttl: runtimeConfig.ttl }),
			});
		}
	}

	return storage;
}
