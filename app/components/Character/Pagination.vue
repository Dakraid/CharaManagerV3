<script setup lang="ts">
const emit = defineEmits(['refresh']);

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();
const clientService = useClientService();

const updatePage = (value: number) => {
	appStore.currentPage = value;
	emit('refresh');
};

const preFetch = async (page: number) => {
	await clientService.getCharacters(page, true);
};
</script>

<template>
	<div class="Pagination-Layout mx-auto w-full max-w-7xl justify-center gap-2">
		<Pagination
			v-slot="{ page }"
			:items-per-page="settingsStore.perPage"
			:total="characterStore.characterCount"
			:default-page="1"
			:show-edges="true"
			:sibling-count="1"
			class="Pagination-Pages"
			@update:page="updatePage">
			<PaginationContent v-slot="{ items }">
				<PaginationPrevious />

				<template v-for="(item, index) in items" :key="index">
					<PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
						<p @mouseover="preFetch(item.value)">{{ item.value }}</p>
					</PaginationItem>
					<PaginationEllipsis v-else :key="page.type" :index="index"> &#8230; </PaginationEllipsis>
				</template>

				<PaginationNext />
			</PaginationContent>
		</Pagination>

		<Button class="Pagination-Button cursor-pointer md:hidden" variant="outline" @click="appStore.toggleActions()">
			<Icon name="lucide:square-pen" size="1.5rem" />
		</Button>
	</div>
</template>

<style scoped>
.Pagination-Layout {
	display: grid;
	grid-template-columns: min-content 64px;
	grid-template-rows: 36px;
	grid-auto-flow: row;
	grid-template-areas: 'Pagination-Pages Pagination-Button';

	@media (width >= 48rem) {
		grid-template-columns: 64px min-content 64px;
		grid-template-rows: 36px;
		grid-template-areas: '. Pagination-Pages Pagination-Button';
	}
}

.Pagination-Pages {
	grid-area: Pagination-Pages;
}

.Pagination-Hint {
	grid-area: Pagination-Hint;
}

.Pagination-Button {
	grid-area: Pagination-Button;
}
</style>
