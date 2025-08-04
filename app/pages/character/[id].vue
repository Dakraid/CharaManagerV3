<script setup lang="ts">
const route = useRoute();

const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();

definePageMeta({
	middleware: ['authenticated'],
});

const character = ref<FullCharacter>();
const isImageLoaded = ref(false);
const imageBlobUrl = ref<string>('');

const fetchImage = async () => {
	try {
		const response = await fetch(`/api/image/full/${character.value?.character.character_id}`);

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
	if (route.params.id && !Array.isArray(route.params.id) && !isNaN(Number(route.params.id))) {
		character.value = await characterStore.getCharacter(Number(route.params.id));

		if (!character.value || !character.value.character || !character.value.definition) {
			throw new Error('Character not found or failed to fetch. Please try again later.');
		}
	}

	await fetchImage();
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<Transition name="fade" mode="out-in">
		<div v-if="character" class="Editor-Layout gap-4 overflow-hidden">
			<div class="Editor-Image flex h-full w-full flex-col flex-nowrap items-center justify-center gap-2 overflow-y-auto rounded-md lg:max-w-[434px]">
				<Button id="clear" type="submit" class="w-full bg-background" variant="outline" @click="$router.back()">
					<span class="sr-only">Back</span>
					<Icon name="lucide:undo-2" size="1.5em" />
				</Button>
				<CharacterPageImage :image-blob-url="imageBlobUrl" :is-image-loaded="isImageLoaded" :censored="settingsStore.censorImages" />
				<Button id="clear" type="submit" class="w-full bg-background" variant="outline" @click="$router.back()">
					<span class="sr-only">Back</span>
					<Icon name="lucide:upload" size="1.5em" />
				</Button>
			</div>
		</div>
	</Transition>
	<CharacterPageEditor :definition="character?.definition!" class="Editor-Content" />
</template>

<style scoped></style>
