<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineProps<{
	imageBlobUrl: string;
	isImageLoaded: boolean;
	censored: boolean;
}>();

const containerRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

const imageNaturalWidth = ref(0);
const imageNaturalHeight = ref(0);
const containerWidth = ref(0);
const containerHeight = ref(0);
const isVerticalFit = ref(true);
const transform = ref({ x: 0, y: 0 });

const calculateFitMode = () => {
	if (!imageRef.value || !containerRef.value) return;

	const imgAspectRatio = imageNaturalWidth.value / imageNaturalHeight.value;
	const containerAspectRatio = containerWidth.value / containerHeight.value;

	isVerticalFit.value = imgAspectRatio > containerAspectRatio;
};

const handleImageLoad = () => {
	if (!imageRef.value) return;

	imageNaturalWidth.value = imageRef.value.naturalWidth;
	imageNaturalHeight.value = imageRef.value.naturalHeight;
	calculateFitMode();
};

const observeContainer = () => {
	if (!containerRef.value) return;

	const resizeObserver = new ResizeObserver((entries) => {
		const entry = entries[0];
		if (!entry) {
			return;
		}
		containerWidth.value = entry.contentRect.width;
		containerHeight.value = entry.contentRect.height;
		calculateFitMode();
	});

	resizeObserver.observe(containerRef.value);

	onUnmounted(() => {
		resizeObserver.disconnect();
	});
};

const handleMouseMove = (event: MouseEvent) => {
	if (!containerRef.value || !imageRef.value) return;

	const rect = containerRef.value.getBoundingClientRect();
	const mouseX = event.clientX - rect.left;
	const mouseY = event.clientY - rect.top;

	const xPercent = mouseX / rect.width;
	const yPercent = mouseY / rect.height;

	let xExcess = 0;
	let yExcess = 0;

	if (isVerticalFit.value) {
		const scaledWidth = (containerHeight.value / imageNaturalHeight.value) * imageNaturalWidth.value;
		xExcess = Math.max(0, scaledWidth - containerWidth.value);
	} else {
		const scaledHeight = (containerWidth.value / imageNaturalWidth.value) * imageNaturalHeight.value;
		yExcess = Math.max(0, scaledHeight - containerHeight.value);
	}

	transform.value = {
		x: xExcess * (0.5 - xPercent),
		y: yExcess * (0.5 - yPercent),
	};
};

const handleMouseLeave = () => {
	transform.value = { x: 0, y: 0 };
};

onMounted(() => {
	observeContainer();
});

watch(
	() => imageRef.value,
	(newImage) => {
		if (newImage && newImage.complete) {
			handleImageLoad();
		}
	}
);
</script>

<template>
	<div ref="containerRef" class="relative h-full w-full overflow-hidden rounded-md border" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
		<Skeleton v-if="!isImageLoaded" class="h-full w-full animate-pulse rounded-md bg-accent" />
		<div v-if="isImageLoaded" class="flex h-full w-full items-center justify-center">
			<img
				ref="imageRef"
				:src="imageBlobUrl"
				loading="lazy"
				crossorigin="use-credentials"
				alt="Character Image"
				:class="cn('rounded-md', censored ? 'censor' : '', isVerticalFit ? 'h-full w-auto' : 'h-auto w-full')"
				:style="{
					transform: `translate(${transform.x}px, ${transform.y}px)`,
				}"
				@load="handleImageLoad" />
		</div>
	</div>
</template>

<style scoped>
img {
	cursor: move;
	will-change: transform;
	max-width: none;
	max-height: none;
}
</style>
