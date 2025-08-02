<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
const appStore = useAppStore();
appStore.isFetching = true;

const characterStore = useCharacterStore();
const { loggedIn } = useUserSession();

const refresh = async () => {
	await characterStore.fetch(false);
};

onMounted(async () => {
	await characterStore.fetch(true);
});
</script>

<template>
	<div class="h-screen overflow-hidden">
		<div class="relative top-40 h-[calc(100vh-133px)] w-full md:top-24">
			<Transition name="fade" mode="out-in">
				<div v-if="appStore.isFetching" class="layout absolute inset-0 z-20">
					<div class="area-pagination relative h-[36px] w-full animate-pulse rounded-md bg-accent/80"></div>
					<div class="area-content mt-4 h-[calc(100%-52px)] w-full animate-pulse rounded-md bg-accent/80"></div>
				</div>
				<div v-else class="layout relative inset-0 grid h-full">
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

					<CharacterSidebar v-if="loggedIn" class="area-actions" @refresh="refresh" />
				</div>
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
		grid-template-columns: 1fr 420px;
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
		height: 100%;
	}
}
</style>
