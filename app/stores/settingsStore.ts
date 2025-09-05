export const useSettingsStore = defineStore('settings', {
	state: () => {
		return {
			perPage: 30,
			censorImages: false,
			censorNames: false,
			permaControls: false,
		};
	},
	getters: {},
	persist: {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});
