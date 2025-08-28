<script setup lang="ts">
const emit = defineEmits(['refresh']);

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();

const updatePage = (value: number) => {
	appStore.currentPage = value;
	emit('refresh');
};

const updatePerPage = (payload: string | number) => {
	settingsStore.perPage = Number(payload);
	emit('refresh');
};
</script>

<template>
	<div class="flex w-full max-w-7xl flex-row flex-nowrap items-center justify-between gap-2 justify-self-center">
		<div class="flex w-full flex-row flex-nowrap items-center justify-center gap-2">
			<Pagination
				v-slot="{ page }"
				:items-per-page="settingsStore.perPage"
				:total="characterStore.characterCount"
				:default-page="1"
				:show-edges="true"
				:sibling-count="0"
				class="mx-0 w-min"
				@update:page="updatePage">
				<PaginationContent v-slot="{ items }">
					<PaginationPrevious />

					<template v-for="(item, index) in items" :key="index">
						<PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
							{{ item.value }}
						</PaginationItem>
					</template>

					<PaginationEllipsis :index="2" />

					<PaginationNext />
				</PaginationContent>
			</Pagination>

			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger as-child>
						<Input type="number" :model-value="settingsStore.perPage" class="w-[4rem]" @update:model-value="updatePerPage" />
					</TooltipTrigger>
					<TooltipContent side="bottom">
						<p>Items per Page</p>
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>

		<Button class="cursor-pointer md:hidden" variant="outline" @click="appStore.toggleActions()">
			<Icon name="lucide:square-pen" size="1.5rem" />
		</Button>
	</div>
</template>

<style scoped></style>
