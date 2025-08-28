export const useAppStore = defineStore('app', {
	state: () => {
		return {
			currentPage: 1,
			isFetching: true,
			showActions: false,
			showOverlay: false,
		};
	},
	getters: {},
	actions: {
		async toggleActions() {
			this.showActions = !this.showActions;
		},
	},
});
