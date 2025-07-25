<script setup lang="ts">
import { cn } from '~~/lib/utils';

const props = defineProps<{
	imageUrl: string;
	censored?: boolean;
}>();

const runtimeConfig = useRuntimeConfig();
const width = runtimeConfig.public.thumbnailWidth ?? 256;
const height = runtimeConfig.public.thumbnailHeight ?? 384;

const backgroundStyles = computed(() => {
	return { backgroundImage: `url('${props.imageUrl}')`, height: `${180 + height}px`, width: `${width}px` };
});
</script>

<template>
	<div :class="cn('Background h-full w-full bg-cover bg-center bg-no-repeat blur-xl', censored ? 'censor' : '')" :style="backgroundStyles"></div>
</template>

<style scoped>
.Background {
	grid-area: 1 / 1 / 5 / 2;
}
</style>
