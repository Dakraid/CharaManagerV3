<script setup lang="ts">
import { toast } from 'vue-sonner';

definePageMeta({
	middleware: ['authenticated'],
});

const route = useRoute();
const router = useRouter();
const appStore = useAppStore();
const settingsStore = useSettingsStore();
const clientService = useClientService();

const character = ref<{ character: Character; definition?: Definition }>();
const isImageLoaded = ref(false);
const imageBlobUrl = ref<string>('');

const goBack = () => {
	appStore.showOverlay = true;
	router.back();
};

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
	const result = idSchema.safeParse(route.params.id);
	if (!result.success) {
		throw createError({
			statusCode: StatusCode.NOT_FOUND,
			statusMessage: 'Character not found or no access.',
		});
	}

	character.value = await clientService.getCharacter(result.data);

	await fetchImage();
	appStore.isFetching = false;
	appStore.showOverlay = false;
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<div class="h-full w-full">
		<Transition name="fade" mode="out-in">
			<div v-if="appStore.isFetching" class="Character-Page-Layout h-full w-full gap-4">
				<div class="Character-Page-Image h-full w-full animate-pulse rounded-md bg-accent lg:min-w-[434px]"></div>
				<div class="Character-Page-Editor h-full w-full animate-pulse rounded-md bg-accent"></div>
			</div>
		</Transition>
		<div v-if="character" class="Character-Page-Layout h-full w-full gap-4">
			<div class="Character-Page-Image flex h-full w-full flex-col flex-nowrap items-center justify-center gap-2 overflow-y-auto rounded-md lg:max-w-[434px]">
				<Button id="clear" type="submit" class="w-full bg-background" variant="outline" @click="goBack">
					<span class="sr-only">Back</span>
					<Icon name="lucide:undo-2" size="1.5em" />
				</Button>
				<CharacterPageImage :image-blob-url="imageBlobUrl" :is-image-loaded="isImageLoaded" :censored="settingsStore.censorImages" />
				<Button id="clear" type="submit" class="w-full bg-background" variant="outline">
					<Icon name="lucide:upload" size="1.5em" />
					<span>Upload Image</span>
				</Button>
			</div>
			<CharacterPageEditorNew :definition="character?.definition!" class="Character-Page-Editor" />
		</div>
	</div>
</template>

<style scoped></style>
