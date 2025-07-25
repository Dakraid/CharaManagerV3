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

const imageURI = img(
	`${runtimeConfig.public.imageDomain.replace(/\/$/, '')}/${props.character.character_id}`,
	{
		width: width,
		height: height,
		quality: quality,
		format: 'webp',
	},
	{
		provider: runtimeConfig.public.imageProvider,
	}
);

const containerStyle = computed(() => {
	return { gridTemplateRows: `50px 40px ${height}px 90px`, width: `${width}px` };
});
</script>

<template>
	<ClientOnly>
		<GlowBorderHover :color="['#A07CFE', '#FE8FB5', '#FFBE7B']" :border-radius="16" class="h-min">
			<div class="Container morph overflow-hidden border" :style="containerStyle">
				<CharacterCardBackground :image-url="imageURI" :censored="settingsStore.censorImages" />
				<CharacterCardHeader :character="character" :censored="settingsStore.censorNames" :width="width" />
				<CharacterCardBody :image-url="imageURI" :censored="settingsStore.censorImages" />
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
