<script setup lang="ts">
definePageMeta({
	middleware: ['authenticated'],
});
</script>

<template>
	<div class="Compare-Layout h-full w-full gap-2 overflow-hidden px-4">
		<div class="Compare-Controls flex h-16 items-center justify-center gap-4 rounded-md border bg-background">
			<Button variant="secondary">
				<Icon name="lucide:arrow-left" size="1.5rem" />
				<span class="ml-2">Prioritize Left Order</span>
			</Button>
			<Button variant="secondary">
				<Icon name="lucide:arrow-right" size="1.5rem" />
				<span class="ml-2">Prioritize Right Order</span>
			</Button>
		</div>
	</div>
</template>

<style scoped>
.Compare-Layout {
	display: grid;
	grid-template-columns: 1fr min-content 1fr;
	grid-template-rows: min-content 1fr;
	grid-auto-flow: row;
}

.Compare-Left {
	grid-area: 2 / 1 / 3 / 2;
}

.Compare-Right {
	grid-area: 2 / 3 / 3 / 4;
}

.Compare-Background {
	grid-area: 1 / 1 / 3 / 4;
}

.Compare-Separator {
	grid-area: 2 / 2 / 3 / 3;
}

.Compare-Controls {
	grid-area: 1 / 1 / 2 / 4;
}
</style>
