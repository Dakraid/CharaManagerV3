export const useAppStore = defineStore('app', {
	state: () => {
		return {
			currentPage: 1,
			isFetching: true,
			showActions: false,
			showOverlay: false,
			showNavigation: false,
		};
	},
	getters: {},
	actions: {
		async toggleActions() {
			this.showActions = !this.showActions;
		},
		async toggleNavigation() {
			this.showNavigation = !this.showNavigation;
		},
	},
});
