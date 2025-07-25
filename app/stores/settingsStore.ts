export const useSettingsStore = defineStore('settings', {
	state: () => {
		return {
			perPage: 30,
			censorImages: false,
			censorNames: false,
			imageQuality: 70,
		};
	},
	getters: {},
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});
