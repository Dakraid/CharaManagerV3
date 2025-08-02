<script setup lang="ts">
const props = defineProps<{
	character: Character;
}>();

const runtimeConfig = useRuntimeConfig();
const settingsStore = useSettingsStore();
const width = runtimeConfig.public.thumbnailWidth ?? 256;
const height = runtimeConfig.public.thumbnailHeight ?? 384;
const quality = settingsStore.imageQuality ?? 70;

const img = useImage();

const imageURI = img(`${runtimeConfig.public.imageDomain.replace(/\/$/, '')}/${props.character.character_id}`, {
	width: width,
	height: height,
	quality: quality,
	format: 'webp',
});

const containerStyle = computed(() => {
	return { gridTemplateRows: `50px 40px ${height}px 90px`, width: `${width}px` };
});

const isImageLoaded = ref(false);
const imageBlobUrl = ref<string>('');

const fetchImage = async () => {
	try {
		const response = await fetch(imageURI);

		if (!response.ok) {
			throw new Error('Failed to fetch image');
		}

		const blob = await response.blob();
		imageBlobUrl.value = URL.createObjectURL(blob);
		isImageLoaded.value = true;
	} catch (error) {
		console.error('Failed to load image:', error);
	}
};

onMounted(() => {
	fetchImage();
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<ClientOnly>
		<GlowBorderHover :color="['#A07CFE', '#FE8FB5', '#FFBE7B']" :border-radius="16" class="h-min">
			<div class="Container morph overflow-hidden border" :style="containerStyle">
				<CharacterCardBackground :image-blob-url="imageBlobUrl" :censored="settingsStore.censorImages" />
				<CharacterCardHeader :character="character" :censored="settingsStore.censorNames" :width="width" />
				<CharacterCardBody :image-blob-url="imageBlobUrl" :is-image-loaded="isImageLoaded" :censored="settingsStore.censorImages" />
				<CharacterCardFooter :character="character" />
			</div>
		</GlowBorderHover>
	</ClientOnly>
</template>

<style scoped>
.Container {
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-flow: row;
	border-radius: calc(var(--radius) + 4px);
}
</style>
