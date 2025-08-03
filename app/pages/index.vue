<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
const { loggedIn } = useUserSession();
const appStore = useAppStore();
appStore.isFetching = true;

const characterStore = useCharacterStore();

onMounted(async () => {
	await characterStore.fetch(true);
});
</script>

<template>
	<Transition name="fade" mode="out-in">
		<div v-if="appStore.isFetching" class="Gallery-Layout h-full w-full px-4">
			<div class="Gallery-Pagination relative mx-auto h-full w-full max-w-7xl animate-pulse rounded-md bg-accent"></div>
			<div class="Gallery-Content h-full w-full animate-pulse rounded-md bg-accent"></div>
			<div v-if="loggedIn" class="Gallery-Actions h-full w-full animate-pulse rounded-md bg-accent"></div>
		</div>
		<div v-else class="Gallery-Layout h-full w-full px-4">
			<CharacterGallery />
		</div>
	</Transition>
</template>

<style scoped></style>
