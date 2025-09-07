export const useCharacterStore = defineStore('character', {
	state: () => {
		return {
			characterCount: 0,
			characterList: [] as Character[] | undefined,
		};
	},
	getters: {},
	actions: {
		getCharacterIndex(id: number): number | undefined {
			return this.characterList?.findIndex((char) => char.character_id === id);
		},
		putCharacter(character: Character): void {
			const index = this.getCharacterIndex(character.character_id);

			if (this.characterList && index) {
				this.characterList[index] = character;
			}
		},
	},
});
