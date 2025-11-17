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
	<div id="remoteFetch" class="Fetch-Layout h-full w-full gap-2">
		<div class="Fetch-Hint flex flex-col">
			<Label class="text-sm text-muted-foreground">One URL per line, supported are:</Label>
			<Label class="text-sm font-light text-muted-foreground">https://chub.ai/characters/author/charactername</Label>
			<Label class="text-sm font-light text-muted-foreground">https://app.wyvern.chat/characters/randomstuff</Label>
		</div>

		<Transition name="fade" mode="out-in" class="Fetch-Input">
			<div v-if="isFetching" class="z-20 flex h-full w-full items-center justify-center rounded-md bg-accent/80">
				<Icon name="lucide:loader-circle" size="2rem" class="mx-auto w-full animate-spin" />
			</div>
		</Transition>

		<div class="Fetch-Input flex w-full flex-col">
			<Textarea :model-value="textUrls" placeholder="Paste URLs here..." class="Fetch-Input max-h-[200px] w-full resize-none break-all" :disabled="isFetching" @update:model-value="onEdit" />

			<Label v-if="errorMessage !== ''" class="w-full text-xs text-red-500">{{ errorMessage }}</Label>
		</div>

		<Button variant="outline" type="submit" class="Fetch-Submit" @click="onSubmit">Fetch</Button>
	</div>
</template>

<style scoped>
.Fetch-Layout {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: min-content min-content min-content;
	grid-template-areas:
		'Hint'
		'Input'
		'Submit';
}

.Fetch-Hint {
	grid-area: Hint;
}

.Fetch-Input {
	grid-area: Input;
}

.Fetch-Submit {
	grid-area: Submit;
}
</style>
