<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineProps<{
	imageBlobUrl: string;
	isImageLoaded: boolean;
	censored: boolean;
}>();
</script>

<template>
	<div class="Body">
		<Skeleton v-if="!isImageLoaded" class="h-full w-full" />
		<img
			:src="imageBlobUrl"
			loading="lazy"
			crossorigin="use-credentials"
			alt="Character Image"
			:class="cn('h-full w-full object-cover transition-all duration-300', isImageLoaded ? 'opacity-100' : 'opacity-0', censored ? 'censor' : '')" />
	</div>
</template>

<style scoped>
.Body {
	grid-area: 3 / 1 / 4 / 2;
}
</style>
