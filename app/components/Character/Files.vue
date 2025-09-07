<script setup lang="ts">
import { toast } from 'vue-sonner';
import { cn } from '~~/lib/utils';

interface Props {
	autoRemove?: boolean;
	acceptMultiple?: boolean;
	acceptedTypes?: string[];
}

const props = withDefaults(defineProps<Props>(), {
	autoRemove: true,
	acceptMultiple: true,
	acceptedTypes: () => ['image/png'],
});

const uploadStore = useUploadStore();
const clientService = useClientService();

const isDragging = ref(false);
const isHovering = ref(false);
const mousePosition = ref({ x: 0, y: 0 });

const openFileSelector = async () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.multiple = props.acceptMultiple;
	input.accept = props.acceptedTypes.join(',');

	input.onchange = async (event) => {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			await uploadStore.addMany(Array.from(target.files));
		}
	};

	input.click();
};

const filterFileTypes = (fileList: FileList | File[]) => {
	const fileArray = Array.from(fileList);
	return fileArray.filter((file) => props.acceptedTypes.includes(file.type));
};

const handleDrop = async (event: DragEvent) => {
	event.preventDefault();
	isDragging.value = false;

	if (event.dataTransfer?.files) {
		if (!props.acceptMultiple && event.dataTransfer.files.length > 1) {
			toast('Please select only one file!');
			return;
		}

		await uploadStore.addMany(filterFileTypes(event.dataTransfer.files));
	}
};

const handleDragOver = (event: DragEvent) => {
	event.preventDefault();
	isDragging.value = true;
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
	mousePosition.value = {
		x: event.clientX - rect.left,
		y: event.clientY - rect.top,
	};
};

const handleDragLeave = (event: DragEvent) => {
	event.preventDefault();
	isDragging.value = false;
};

const handleDragEnter = (event: DragEvent) => {
	event.preventDefault();
	isDragging.value = true;
};

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

const handleUploaded = async (upload: Upload) => {
	if (props.autoRemove) {
		await uploadStore.remove(upload);
	}

	await clientService.getCharacters();
};

const handleRemove = async (upload: Upload) => {
	await uploadStore.remove(upload);
};

const handleClear = async () => {
	await uploadStore.clear();
};

const shouldHighlight = computed(() => isDragging.value || isHovering.value);

const circleStyle = computed(() => ({
	transform: `translate(-50%, -50%)`,
	left: `${mousePosition.value.x}px`,
	top: `${mousePosition.value.y}px`,
}));
</script>

<template>
	<div id="fileUpload" class="relative flex min-h-0 w-full flex-1 flex-col justify-start gap-2 rounded-md">
		<div class="grid w-full grid-cols-[1fr_min-content] justify-center gap-2">
			<Button
				variant="ghost"
				class="relative min-h-12 w-full overflow-clip border"
				@click="openFileSelector"
				@drop="handleDrop"
				@dragover="handleDragOver"
				@dragenter="handleDragEnter"
				@dragleave="handleDragLeave"
				@mouseenter="handleMouseEnter"
				@mouseleave="handleMouseLeave"
				@mousemove="handleMouseMove">
				<div :class="cn('overlay absolute z-0 h-96 w-96 rounded-full bg-neutral-600 opacity-0 blur-xl', shouldHighlight ? 'block h-48 w-48 opacity-40' : '')" :style="circleStyle"></div>
				<h1 class="z-10">Click to select or drop files here...</h1>
			</Button>
			<Transition name="fade" mode="out-in">
				<Button v-if="uploadStore.files.length > 0" variant="destructive" size="icon" class="h-12 w-12" @click="handleClear">
					<Icon name="lucide:trash" size="1.25rem" />
				</Button>
			</Transition>
		</div>

		<div v-if="uploadStore.files.length > 0" class="min-h-0 w-full flex-1 overflow-y-auto pr-2">
			<CharacterFilesItem v-for="upload in uploadStore.files" :key="upload.file.name" :upload="upload" @uploaded="handleUploaded(upload)" @remove="handleRemove(upload)" />
		</div>
	</div>
</template>

<style scoped>
.overlay {
	transition:
		opacity 0.2s ease-in-out,
		height 0.2s ease-in-out,
		width 0.2s ease-in-out;
}
</style>
