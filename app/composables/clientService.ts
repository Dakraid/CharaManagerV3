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
	characterCache: Record<string, Character[]> = {};

	constructor() {
		this.settingsStore = useSettingsStore();
		this.characterStore = useCharacterStore();
		this.appStore = useAppStore();
	}

	private isErrorResponse(value: unknown): value is responseType {
		return typeof value === 'object' && value !== null && 'statusCode' in value && 'message' in value;
	}

	private getKey() {
		const { user } = useUserSession();
		return `${user.id ?? '00000000-0000-0000-0000-000000000000'}-${this.appStore.currentPage}-${this.settingsStore.perPage}-${this.characterStore.characterCount}`;
	}

	private fetchCharacters = debounce(async () => {
		try {
			this.characterStore.characterCount = await $fetch<number>('/api/characters/count', {
				method: 'POST',
			});

			const cached = this.characterCache[this.getKey()];
			if (cached) {
				console.log('Using cached characters');
				this.characterStore.characterList = cached;
			} else {
				this.characterStore.characterList = await $fetch<Character[]>('/api/characters/list', {
					method: 'POST',
					body: {
						perPage: this.settingsStore.perPage,
						page: this.appStore.currentPage,
						key: this.getKey(),
					},
				});
				this.characterCache[this.getKey()] = this.characterStore.characterList;
			}
		} catch (error: any) {
			throw new Error(error);
		}
	}, 150);

	async getCharacters() {
		this.appStore.showOverlay = true;
		await this.fetchCharacters();
		this.appStore.showOverlay = false;
	}

	async getCharacter(id: number): Promise<FullCharacter> {
		const response = await $fetch<FullCharacter | responseType>('/api/character', {
			method: 'GET',
			query: {
				id: id,
			},
		});

		if (this.isErrorResponse(response)) {
			throw new Error(response.message);
		}

		return response;
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
