<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineProps<{
	imageBlobUrl: string;
	isImageLoaded: boolean;
	censored: boolean;
}>();

const runtimeConfig = useRuntimeConfig();
const width = runtimeConfig.public.thumbnailWidth ?? 256;
const height = runtimeConfig.public.thumbnailHeight ?? 384;
</script>

<template></template>

<style scoped></style>
