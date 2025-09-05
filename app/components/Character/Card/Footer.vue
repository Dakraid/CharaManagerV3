<script setup lang="ts">
const props = defineProps<{
	character: Character;
	downloading: boolean;
}>();

defineEmits(['visibility', 'download', 'edit', 'delete']);

const columnStyle = computed(() => {
	return { gridTemplateColumns: props.character.owned ? '1fr 1fr 1fr' : '1fr 1fr' };
});
</script>

<template>
	<div class="Controls bg-white/50 dark:bg-black/60" :style="columnStyle">
		<h1 class="grow text-center text-sm">Total: {{ character.total_token_count }}</h1>
		<CharacterButtonVisibility v-if="character.owned" :visibility="character.public_visible" @click="$emit('visibility')" />
		<h1 class="grow text-center text-sm">Perma: {{ character.perma_token_count }}</h1>
		<CharacterButtonDownload :single-width="character.owned ?? false" :downloading="downloading" @click="$emit('download')" />
		<CharacterButtonEdit v-if="character.owned" @click="$emit('edit')" />
		<CharacterButtonDelete v-if="character.owned" @click="$emit('delete')" />
	</div>
</template>

<style scoped>
.Controls {
	grid-area: 4 / 1 / 5 / 2;
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: calc(var(--spacing) * 2);
	padding: calc(var(--spacing) * 2);
	padding-top: calc(var(--spacing) * 1);
	height: 90px;
	justify-items: stretch;
	align-items: center;
}
</style>
