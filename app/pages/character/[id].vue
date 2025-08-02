<script setup lang="ts">
const route = useRoute();
const img = useImage();

const runtimeConfig = useRuntimeConfig();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();

const quality = settingsStore.imageQuality ?? 70;

definePageMeta({
	middleware: ['authenticated'],
});

const character = ref<FullCharacter>();
const isImageLoaded = ref(false);
const imageBlobUrl = ref<string>('');

if (route.params.id && !Array.isArray(route.params.id) && !isNaN(Number(route.params.id))) {
	character.value = await characterStore.getCharacter(Number(route.params.id));

	if (!character.value || !character.value.character || !character.value.definition) {
		throw new Error('Character not found or failed to fetch. Please try again later.');
	}
}

const fetchImage = async () => {
	try {
		const imageURI = img(`${runtimeConfig.public.imageDomain.replace(/\/$/, '')}/${character.value?.character.character_id}`, {
			quality: quality,
			format: 'webp',
		});

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

onMounted(async () => {
	await fetchImage();
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<div class="flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-y-auto px-4 lg:flex-nowrap">
		<div class="flex h-full w-full flex-col flex-nowrap items-center justify-center gap-2 overflow-y-auto lg:max-w-[434px]">
			<Button id="clear" type="submit" variant="outline" class="w-full" @click="$router.back()">
				<span class="sr-only">Back</span>
				<Icon name="lucide:back-2" class="h-[1.2rem] w-[1.2rem]" />
			</Button>
			<CharacterPageImage :image-blob-url="imageBlobUrl" :is-image-loaded="isImageLoaded" :censored="settingsStore.censorImages" />
		</div>
		<CharacterPageEditor :definition="character?.definition!" />
	</div>
</template>

<style></style>
