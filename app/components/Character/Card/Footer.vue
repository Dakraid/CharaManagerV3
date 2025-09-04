<script setup lang="ts">
const props = defineProps<{
	character: Character;
}>();

const isDownloading = ref(false);

const appStore = useAppStore();
const characterStore = useCharacterStore();

const downloadCharacter = async () => {
	isDownloading.value = true;
	await characterStore.downloadCharacter(props.character.character_id);
	isDownloading.value = false;
};

const deleteCharacter = async () => {
	await characterStore.deleteCharacter(props.character.character_id);
};

const updateVisibility = async () => {
	await characterStore.updateVisibility(props.character.character_id, !props.character.public_visible);
};

const openCharacter = async () => {
	appStore.showOverlay = true;
	await navigateTo({
		path: `/character/${props.character.character_id}`,
	});
};

const columnStyle = computed(() => {
	return { gridTemplateColumns: props.character.owned ? '1fr 1fr 1fr' : '1fr 1fr' };
});
</script>

<template>
	<div class="Controls bg-white/50 dark:bg-black/60" :style="columnStyle">
		<h1 class="grow text-center text-sm">Total: {{ character.total_token_count }}</h1>
		<CharacterButtonVisibility v-if="character.owned" :visibility="character.public_visible" @click="updateVisibility" />
		<h1 class="grow text-center text-sm">Perma: {{ character.perma_token_count }}</h1>
		<CharacterButtonDownload :single-width="character.owned ?? false" :is-downloading="isDownloading" @click="downloadCharacter" />
		<CharacterButtonEdit v-if="character.owned" @click="openCharacter" />
		<CharacterButtonDelete v-if="character.owned" @click="deleteCharacter" />
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
