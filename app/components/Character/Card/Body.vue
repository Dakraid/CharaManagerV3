<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineProps<{
	imageUrl: string;
	censored: boolean;
}>();

const runtimeConfig = useRuntimeConfig();
const width = runtimeConfig.public.thumbnailWidth ?? 256;
const height = runtimeConfig.public.thumbnailHeight ?? 384;

const isImageLoaded = ref(false);

const handleImageLoad = () => {
	isImageLoaded.value = true;
};

const handleImageError = () => {
	console.error('Failed to load image');
};
</script>

<template>
	<div class="Body">
		<Skeleton v-if="!isImageLoaded" class="h-full w-full" />
		<img
			:src="imageUrl"
			loading="lazy"
			crossorigin="use-credentials"
			alt="Character Image"
			:class="cn('h-full w-full object-cover transition-all duration-300', isImageLoaded ? 'opacity-100' : 'opacity-0', censored ? 'censor' : '')"
			:style="`min-height: ${height}px; min-width: ${width}px; max-height: ${height}px; max-width: ${width}px;`"
			@load="handleImageLoad"
			@error="handleImageError" />
	</div>
</template>

<style scoped>
.Body {
	grid-area: 3 / 1 / 4 / 2;
}
</style>
