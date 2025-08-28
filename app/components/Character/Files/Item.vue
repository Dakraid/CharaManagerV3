<script setup lang="ts">
import { toast } from 'vue-sonner';
import { cn } from '~~/lib/utils';

const props = defineProps<{
	upload: Upload;
}>();

const emit = defineEmits(['uploaded', 'remove']);

const imageUrl = ref<string>('');

const isUploaded = ref(false);
const isProcessing = ref(false);
const isFailure = ref(false);
const isHovering = ref(false);

const mousePosition = ref({ x: 0, y: 0 });

const containerRef = ref<HTMLElement>();
const imageRef = ref<HTMLImageElement>();

const handleMouseEnter = () => {
	isHovering.value = true;
};

const handleMouseLeave = () => {
	isHovering.value = false;
};

const handleMouseMove = (event: MouseEvent) => {
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
	mousePosition.value = {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	};
};

const uploadFile = async () => {
	isProcessing.value = true;

	const formData = new FormData();
	formData.append('file', props.upload.file);
	formData.append('origin', props.upload.origin);
	formData.append('public', `${props.upload.public}`);

	try {
		const response = await fetch('/api/character', {
			method: 'PUT',
			body: formData,
		});

		if (!response.ok) {
			if (response.status === 401) {
				toast('Please authenticate before uploading!');
			} else {
				toast(`HTTP Error! Status: ${response.status}`);
			}
			isFailure.value = true;
			isProcessing.value = false;
			return;
		}

		const result: UploadResult = await response.json();

		if (result.success) {
			toast('Character uploaded successfully!');
			isUploaded.value = true;
		} else {
			toast(`'Upload failed! ${result.error}`);
			isProcessing.value = false;
			isFailure.value = true;
			return;
		}

		isProcessing.value = false;
		emit('uploaded');
	} catch (err: any) {
		toast(`'Upload failed! ${err.message}`);

		isProcessing.value = false;
		isFailure.value = true;
	}
};

const imageStyle = computed(() => {
	if (!isHovering.value || !containerRef.value || !imageRef.value) {
		return {
			width: '100%',
			height: '100%',
			objectFit: 'cover' as const,
		};
	}

	const container = containerRef.value;
	const image = imageRef.value;

	const containerWidth = container.offsetWidth;
	const containerHeight = container.offsetHeight;

	const imageWidth = image.naturalWidth;
	const imageHeight = image.naturalHeight;

	const scaleX = containerWidth / imageWidth;
	const scaleY = containerHeight / imageHeight;
	const scale = Math.max(scaleX, scaleY);

	const scaledWidth = imageWidth * scale;
	const scaledHeight = imageHeight * scale;

	const excessWidth = scaledWidth - containerWidth;
	const excessHeight = scaledHeight - containerHeight;

	const mouseXPercent = mousePosition.value.x / containerWidth;
	const mouseYPercent = mousePosition.value.y / containerHeight;

	const translateX = -excessWidth * mouseXPercent;
	const translateY = -excessHeight * mouseYPercent;

	return {
		transform: `translate(${translateX}px, ${translateY}px)`,
		transformOrigin: 'center center',
	};
});

onMounted(() => {
	try {
		if (props.upload.file && props.upload.file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (e) => {
				imageUrl.value = e.target?.result as string;
			};
			reader.readAsDataURL(props.upload.file);
		}
	} catch (err: any) {
		console.error(err);
		emit('remove');
	}
});

onUnmounted(() => {
	if (imageUrl.value) {
		URL.revokeObjectURL(imageUrl.value);
	}
});
</script>

<template>
	<div class="flex flex-col items-center rounded-md pt-4 first:pt-0">
		<div v-if="imageUrl" class="w-full rounded-md bg-accent">
			<div
				ref="containerRef"
				class="relative h-52 w-full overflow-hidden rounded-md"
				@mouseenter="handleMouseEnter"
				@mouseleave="handleMouseLeave"
				@mousemove="handleMouseMove">
				<img ref="imageRef" :src="imageUrl" :alt="upload.file.name" :style="imageStyle" class="-z-10 transition-transform duration-300 ease-out" />
				<Transition name="fade" mode="out-in">
					<div v-if="isUploaded" class="absolute top-0 left-0 z-0 h-full w-full inset-shadow-2xl inset-shadow-green-500/50"></div>
					<div v-else-if="isFailure" class="absolute top-0 left-0 z-0 h-full w-full inset-shadow-2xl inset-shadow-red-500/50"></div>
					<div v-else class="absolute top-0 left-0 z-0 h-full w-full"></div>
				</Transition>
				<Button
					size="icon"
					:class="cn('absolute top-2 right-2 z-20 rounded-full', isUploaded ? 'bg-green-500' : '')"
					:disabled="isProcessing || isUploaded"
					@click="uploadFile">
					<Transition name="fade" mode="out-in">
						<Icon v-if="isProcessing" name="lucide:loader-circle" size="1.5rem" class="animate-spin" />
						<Icon v-else-if="isUploaded" name="lucide:check" size="1.5rem" class="text-white" />
						<Icon v-else-if="isFailure" name="lucide:refresh-cw" size="1.5rem" />
						<Icon v-else name="lucide:upload" size="1.5rem" />
					</Transition>
				</Button>
				<Button variant="destructive" size="icon" class="absolute top-2 left-2 z-20 rounded-full" @click="$emit('remove')">
					<Icon name="lucide:x" size="1.5rem" />
				</Button>
				<div class="absolute bottom-0 grid grid-cols-[1fr_1fr_1fr] items-center bg-background/40 p-2">
					<p class="justify-self-start text-sm">{{ new Date(upload.file.lastModified).toLocaleString() }}</p>
					<p class="text-md justify-self-center">{{ upload.file.name }}</p>
					<p class="justify-self-end text-sm">{{ (upload.file.size / 1024).toFixed(1) }} KB</p>
				</div>
			</div>
		</div>
		<div v-else class="text-xl font-bold">Loading Preview...</div>
	</div>
</template>

<style scoped></style>
