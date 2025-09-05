import { toast } from 'vue-sonner';

export const useCharacterStore = defineStore('character', {
	state: () => {
		return {
			characterCount: 0,
			characterList: [] as Character[] | undefined,
		};
	},
	getters: {},
	actions: {
		async fetch(indicate: boolean = true): Promise<void> {
			const appStore = useAppStore();
			const settingsStore = useSettingsStore();
			appStore.isFetching = indicate ? true : appStore.isFetching;

			this.characterCount = await $fetch<number>('/api/characters/count', {
				method: 'POST',
			});

			const characterArray = await $fetch<Character[]>('/api/characters/list', {
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
		async getCharacterWithDefinition(id: number): Promise<{ character: Character; definition?: Definition }> {
			return await $fetch<{ character: Character; definition?: Definition }>('/api/character', {
				method: 'GET',
				query: {
					id: id,
				},
			});
		},
		async refreshCharacter(id: number): Promise<void> {
			try {
				const response = await $fetch<{ character: Character; definition?: Definition }>('/api/character', {
					method: 'GET',
					query: {
						id: id,
					},
				});
				const index = this.characterList?.findIndex((char) => {
					return char.character_id === id;
				});

				if (response.character && this.characterList && index) {
					this.characterList[index] = response.character;
				}
			} catch (error) {
				console.error('Failed to refresh character:', error);
			}
		},
		async deleteCharacter(id: number): Promise<void> {
			const result = await $fetch('/api/character', {
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
		async downloadCharacter(id: number): Promise<void> {
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
		async updateVisibility(id: number, visibility: boolean): Promise<void> {
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
