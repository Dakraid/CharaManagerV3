export const useCacheStore = defineStore('cache', {
	state: () => {
		return {
			characterCache: {} as Record<string, Character[]>,
			fullCharacterCache: {} as Record<string, FullCharacter>,
		};
	},
	getters: {},
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});
