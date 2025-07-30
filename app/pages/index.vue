<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
import { toast } from 'vue-sonner';

const appStore = useAppStore();
appStore.isFetching = true;

const characterStore = useCharacterStore();
const { loggedIn, clear } = useUserSession();

const refresh = async () => {
	await characterStore.fetch(false);
};

onMounted(async () => {
	if (loggedIn.value) {
		const validation = await $fetch('/api/auth/validate', {
			method: 'POST',
		});

		if (validation.statusCode !== 200) {
			await clear();
			toast('Session expired. Please login again.');
		}
	}

	await characterStore.fetch(true);
});
</script>

<template>
	<div class="overflow-hidden">
		<Transition name="fade">
			<div v-if="appStore.isFetching" class="layout absolute top-40 z-20 grid h-[calc(100%-133px)] w-full md:top-24">
				<div class="area-pagination h-full min-h-[36px] w-full animate-pulse rounded-md bg-accent/80"></div>
				<div class="area-pagination h-full min-h-[36px] w-full rounded-md backdrop-blur-md"></div>
				<div class="area-content mt-4 h-full w-full animate-pulse rounded-md bg-accent/80"></div>
				<div class="area-content mt-4 h-full w-full rounded-md backdrop-blur-md"></div>
			</div>
		</Transition>
		<div class="layout absolute top-40 grid h-[calc(100%-133px)] w-full md:top-24">
			<CharacterPagination class="area-pagination" @refresh="refresh" />

			<div v-if="characterStore.characterList && characterStore.characterList.length > 0" class="area-content h-full overflow-hidden">
				<ScrollArea class="h-full rounded-xl border bg-background">
					<div class="flex h-full w-full flex-wrap justify-around gap-4 p-6">
						<LazyCharacterCard v-for="character in characterStore.characterList" :key="character.character_id" :character="character" />
					</div>
				</ScrollArea>
			</div>
			<div v-else class="area-content h-full overflow-hidden">
				<div class="flex h-full w-full flex-col items-center justify-center gap-4">
					<Icon name="lucide:file-question-mark" size="5rem" class="animate-bounce" />
					<div class="flex flex-col items-center justify-center">
						<h1 class="text-2xl font-bold">No characters to list.</h1>
						<h1 class="text-xl font-normal">Please login to also see your private characters.</h1>
					</div>
				</div>
			</div>

			<Transition>
				<CharacterSidebar v-if="loggedIn" class="area-actions" @refresh="refresh" />
			</Transition>
		</div>
	</div>
</template>

<style scoped>
.layout {
	padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 4) calc(var(--spacing) * 4);
	grid-template-columns: 1fr;
	grid-template-rows: min-content 1fr;
	grid-template-areas:
		'Pagination'
		'Content';

	@media (width >= 48rem) {
		grid-template-columns: 1fr min-content;
		grid-template-rows: min-content 1fr;
		grid-template-areas:
			'Pagination Pagination'
			'Content Actions';
	}
}

.area-pagination {
	grid-area: Pagination;
}

.area-content {
	grid-area: Content;
	column-span: 1;
}

.area-actions {
	grid-area: Content;

	@media (width >= 48rem) {
		grid-area: Actions;
		display: block;
		opacity: 100;
	}
}
</style>
