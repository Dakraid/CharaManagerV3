<script setup lang="ts">
import { toast } from 'vue-sonner';

const uploadStore = useUploadStore();

const textUrls = ref('');
const errorMessage = ref('');
const isFetching = ref(false);

const onEdit = async (payload: string | number) => {
	payload = payload as string;
	textUrls.value = payload;
	const verify = MultiUriSchema.safeParse(payload);

	if (!verify.success) {
		uploadStore.urls = [];
		errorMessage.value = verify.error!.issues.map((issue) => issue.message).join(', ');
		return;
	}

	errorMessage.value = '';
	uploadStore.urls = verify.data;
};

const onSubmit = async () => {
	isFetching.value = true;
	const failed: string[] = [];
	for (const url of uploadStore.urls) {
		if (url.startsWith('https://app.wyvern.chat/characters/')) {
			try {
				const result = await $fetch('/api/sites/wyvern', {
					method: 'POST',
					body: {
						targetUri: url,
					},
				});

				if (!result.fileContent) {
					throw new Error('No file content.');
				}

				const blob = await base64ToBlob(result.fileContent);
				const newFile = new File([blob], result.fileName, {
					type: result.fileType,
					lastModified: result.lastModified,
				});

				await uploadStore.add({ file: newFile, origin: result.origin, public: result.public });
			} catch (err: any) {
				failed.push(url);
				toast('Failed to fetch: ' + err.message);
			}
		} else {
			try {
				const result = await $fetch('/api/sites/chubai', {
					method: 'POST',
					body: {
						targetUri: url,
					},
				});

				if (!result.fileContent) {
					throw new Error('No file content.');
				}

				const blob = await base64ToBlob(result.fileContent);
				const newFile = new File([blob], result.fileName, {
					type: result.fileType,
					lastModified: result.lastModified,
				});

				await uploadStore.add({ file: newFile, origin: result.origin, public: result.public });
			} catch (err: any) {
				failed.push(url);
				toast('Failed to fetch: ' + err.message);
			}
		}
	}

	uploadStore.urls = failed;
	textUrls.value = failed.join('\n');
	isFetching.value = false;
};
</script>

<template>
	<div class="flex h-full w-full flex-col gap-2">
		<Transition name="fade" mode="out-in" class="grid-layout relative">
			<div v-if="isFetching" class="grid-area absolute inset-0 z-20 flex h-full w-full items-center justify-center bg-accent/50">
				<Icon name="lucide:loader-circle" size="1.5rem" class="animate-spin" />
			</div>
			<Textarea
				v-else
				:model-value="textUrls"
				placeholder="Paste URLs here..."
				class="grid-area absolute inset-0 h-full max-h-[300px] w-full resize-none"
				:disabled="isFetching"
				@update:model-value="onEdit" />
		</Transition>
		<Label v-if="errorMessage !== ''" class="absolute inset-0 text-sm text-red-500">{{ errorMessage }}</Label>
		<div class="flex flex-col">
			<Label class="mt-1 text-sm text-muted-foreground">One URL per line, supported are:</Label>
			<div class="mt-1 rounded-md border p-2">
				<Label class="text-sm font-light text-muted-foreground">https://chub.ai/characters/author/charactername</Label>
				<Label class="text-sm font-light text-muted-foreground">https://app.wyvern.chat/characters/randomstuff</Label>
			</div>
		</div>
		<Button variant="outline" type="submit" @click="onSubmit">Fetch</Button>
	</div>
</template>

<style scoped>
.grid-layout {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr;
	grid-template-areas: 'layout';
}

.grid-area {
	grid-area: layout;
}
</style>
