<script setup lang="ts">
const bundle = defineModel<ChatCompletionPresetBundle>('bundle', { required: false });
defineProps<{
	prompts?: Prompt[];
}>();

defineEmits(['upload']);
</script>

<template>
	<div class="flex flex-col gap-2">
		<div class="flex flex-row items-center rounded-md border bg-background p-2">
			<Button variant="secondary" @click="$emit('upload')">
				<Icon name="lucide:upload" size="1.5rem" />
				<span class="sr-only">Upload</span>
			</Button>
			<h1 class="w-full grow text-center text-2xl font-bold">{{ bundle?.title ?? 'Unknown' }}</h1>
		</div>
		<div v-if="bundle && prompts" class="flex flex-col gap-4 overflow-y-auto rounded-md border border-r-0 bg-background p-4">
			<PresetBlock v-for="prompt in prompts" :key="prompt.identifier" :prompt="prompt" />
		</div>
	</div>
</template>

<style scoped></style>
