<script setup lang="ts">
const characterStore = useCharacterStore();
const { loggedIn } = useUserSession();

const refresh = async () => {
	await characterStore.fetch(false);
};
</script>

<template>
	<CharacterPagination class="Gallery-Pagination" @refresh="refresh" />

	<div v-if="!characterStore.characterList || characterStore.characterList.length === 0" class="Gallery-Content h-full overflow-hidden">
		<div class="flex h-full w-full flex-col items-center justify-center gap-4">
			<Icon name="lucide:file-question-mark" size="5rem" class="animate-bounce" />
			<div class="flex flex-col items-center justify-center">
				<h1 class="text-2xl font-bold">No characters to list.</h1>
				<h1 class="text-xl font-normal">Please login to also see your private characters.</h1>
			</div>
		</div>
	</div>

	<div
		v-else
		class="Gallery-Content flex h-full w-full flex-wrap justify-evenly gap-4 overflow-x-hidden overflow-y-scroll rounded-md border border-r-0 bg-background px-4 py-6">
		<LazyCharacterCard v-for="character in characterStore.characterList" :key="character.character_id" :character="character" />
	</div>

	<CharacterSidebar v-if="loggedIn" class="Gallery-Actions" @refresh="refresh" />
</template>

<style scoped>
.Fader {
	box-shadow: inset 0 -20px 25px -5px rgb(0 0 0);
	height: 50px;
	width: calc(100% - 0.625rem);
	z-index: 30;
	margin-top: auto;
	border-radius: 0 0 calc(var(--radius) - 2px) calc(var(--radius) - 2px);
	position: relative;
}
</style>
