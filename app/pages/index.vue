<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
import { cn } from '~~/lib/utils';

const { loggedIn } = useUserSession();
const appStore = useAppStore();
const characterStore = useCharacterStore();

appStore.showOverlay = true;
appStore.isFetching = true;

onMounted(async () => {
	await characterStore.fetch(true);
	appStore.showOverlay = false;
});
</script>

<template>
	<div class="h-full w-full">
		<Transition name="fade" mode="out-in">
			<div v-if="appStore.isFetching" :class="cn('Gallery-Layout h-full w-full px-4', loggedIn ? '' : 'Gallery-Layout-NoActions')">
				<div class="Gallery-Pagination relative mx-auto h-full w-full max-w-7xl animate-pulse rounded-md bg-accent"></div>
				<div class="Gallery-Content h-full w-full animate-pulse rounded-md bg-accent"></div>
				<div v-if="loggedIn" class="Gallery-Actions h-full w-full animate-pulse rounded-md bg-accent"></div>
			</div>
			<div v-else :class="cn('Gallery-Layout h-full w-full px-4', loggedIn ? '' : 'Gallery-Layout-NoActions')">
				<CharacterGallery />
			</div>
		</Transition>
	</div>
</template>

<style scoped></style>
