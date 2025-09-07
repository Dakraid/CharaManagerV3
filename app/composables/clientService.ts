import { debounce } from 'perfect-debounce';
import { toast } from 'vue-sonner';

let clientService: ClientService | undefined;

export const useClientService = () => {
	if (!clientService) {
		clientService = new ClientService();
	}
	return clientService;
};

class ClientService {
	settingsStore: PiniaStore<typeof useSettingsStore>;
	characterStore: PiniaStore<typeof useCharacterStore>;
	appStore: PiniaStore<typeof useAppStore>;
	cacheStore: PiniaStore<typeof useCacheStore>;

	constructor() {
		this.settingsStore = useSettingsStore();
		this.characterStore = useCharacterStore();
		this.appStore = useAppStore();
		this.cacheStore = useCacheStore();
	}

	private isErrorResponse(value: unknown): value is responseType {
		return typeof value === 'object' && value !== null && 'statusCode' in value && 'message' in value;
	}

	private getKey() {
		const { user } = useUserSession();
		return `${user.id ?? '00000000-0000-0000-0000-000000000000'}-${this.appStore.currentPage}-${this.settingsStore.perPage}-${this.characterStore.characterCount}`;
	}

	private fetchCharacters = debounce(async (page: number, preFetch: boolean = false) => {
		try {
			this.characterStore.characterCount = await $fetch<number>('/api/characters/count', {
				method: 'POST',
			});

			const cached = this.cacheStore.characterCache[this.getKey()];
			if (cached) {
				this.characterStore.characterList = cached;
			} else {
				const characterList = await $fetch<Character[]>('/api/characters/list', {
					method: 'POST',
					body: {
						perPage: this.settingsStore.perPage,
						page: page,
						key: this.getKey(),
					},
				});

				this.cacheStore.characterCache[this.getKey()] = characterList;

				if (!preFetch) {
					this.characterStore.characterList = characterList;
				}
			}
		} catch (error: any) {
			throw new Error(error);
		}
	}, 100);

	async getCharacters(page?: number, preFetch?: boolean) {
		this.appStore.showOverlay = !preFetch;
		await this.fetchCharacters(page ?? this.appStore.currentPage, preFetch ?? false);
		this.appStore.showOverlay = false;
	}

	async getCharacter(id: number): Promise<FullCharacter> {
		const cached = this.cacheStore.fullCharacterCache[id];
		if (cached) {
			return cached;
		} else {
			const response = await $fetch<FullCharacter | responseType>('/api/character', {
				method: 'GET',
				query: {
					id: id,
				},
			});

			if (this.isErrorResponse(response)) {
				throw new Error(response.message);
			}

			this.cacheStore.fullCharacterCache[id] = response;

			return response;
		}
	}

	async refreshCharacter(id: number): Promise<void> {
		try {
			const character = await this.getCharacter(id);
			this.characterStore.putCharacter(character.character);
		} catch (error) {
			console.error('Failed to refresh character:', error);
		}
	}

	async deleteCharacter(id: number): Promise<void> {
		const response = await $fetch<responseType>('/api/character', {
			method: 'DELETE',
			body: {
				id: id,
			},
		});

		if (response.statusCode === 200) {
			toast('Successfully deleted character.');
		} else {
			toast('Failed to delete character:' + response.message);
		}

		await this.getCharacters();
	}

	async downloadCharacter(id: number): Promise<void> {
		const response = await $fetch<Blob | responseType>('/api/character/download', {
			method: 'POST',
			body: {
				id: id,
			},
			responseType: 'blob',
		});

		if (this.isErrorResponse(response)) {
			throw new Error(response.message);
		}

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
	}

	async updateVisibility(id: number, visibility: boolean): Promise<void> {
		const response = await $fetch<responseType>('/api/character/visibility', {
			method: 'PATCH',
			body: {
				id: id,
				public: visibility,
			},
		});

		if (response.statusCode === 200) {
			toast('Successfully updated visibility.');
		} else {
			toast('Failed to update visibility:' + response.message);
		}

		await this.getCharacters();
	}
}
