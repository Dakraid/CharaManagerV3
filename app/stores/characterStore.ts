import { toast } from 'vue-sonner';

export const useCharacterStore = defineStore('character', {
	state: () => {
		return {
			characterCount: 0,
			characterList: [] as Character[] | null,
		};
	},
	getters: {},
	actions: {
		async fetch(indicate: boolean = true) {
			const appStore = useAppStore();
			const settingsStore = useSettingsStore();
			appStore.isFetching = indicate ? true : appStore.isFetching;

			this.characterCount = await $fetch<number>('/api/characters/count', {
				method: 'POST',
			});

			const { characterArray } = await $fetch<CharacterList>('/api/characters/list', {
				method: 'POST',
				body: {
					perPage: settingsStore.perPage,
					page: appStore.currentPage,
					key: ``,
				},
			});

			if (characterArray) {
				this.characterList = characterArray;
			}

			appStore.isFetching = indicate ? false : appStore.isFetching;
		},
		async deleteCharacter(id: number) {
			const result = await $fetch('/api/character/character', {
				method: 'DELETE',
				body: {
					id: id,
				},
			});

			if (result.statusCode === 200) {
				toast(result.message);
				await this.fetch();
			} else {
				toast('Failed to update visibility. Please try again later.');
			}
		},
		async downloadCharacter(id: number) {
			const response = await $fetch<Blob>('/api/character/download', {
				method: 'POST',
				body: {
					id: id,
				},
				responseType: 'blob',
			});

			if (!response) {
				toast('Failed to download character. Please try again later.');
				return;
			}

			const url = URL.createObjectURL(response);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = `${id}.png`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);
		},
		async updateVisibility(id: number, visibility: boolean) {
			const result = await $fetch('/api/character/visibility', {
				method: 'PATCH',
				body: {
					id: id,
					public: visibility,
				},
			});

			if (result.statusCode === 200) {
				toast(result.message);
				await this.fetch();
			} else {
				toast('Failed to update visibility. Please try again later.');
			}
		},
	},
});
