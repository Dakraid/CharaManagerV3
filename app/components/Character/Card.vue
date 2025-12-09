<script setup lang="ts">
import { toast } from 'vue-sonner';
import { cn } from '~~/lib/utils';

const props = defineProps<{
	character: Character;
}>();

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const clientService = useClientService();

const downloading = ref(false);
const imageLoaded = ref(false);
const isHovering = ref(false);

const evaluation = ref<Evaluation | undefined>();
const imageBlobUrl = ref<string>('');

const downloadCharacter = async () => {
	downloading.value = true;
	await clientService.downloadCharacter(props.character.character_id);
	downloading.value = false;
};

const updateVisibility = async () => {
	await clientService.updateVisibility(props.character.character_id, !props.character.public_visible);
};

const deleteCharacter = async () => {
	await clientService.deleteCharacter(props.character.character_id);
};

const editCharacter = async () => {
	appStore.showOverlay = true;
	await navigateTo({
		path: `/character/${props.character.character_id}`,
	});
};

const prefetchCharacter = async () => {
	await clientService.getCharacter(props.character.character_id);
};

const fetchImage = async () => {
	try {
		const response = await fetch(`/api/image/full/${props.character.character_id}`);

		if (!response.ok) {
			console.error('Failed to fetch image');
			return;
		}

		const blob = await response.blob();
		imageBlobUrl.value = URL.createObjectURL(blob);
		imageLoaded.value = true;
	} catch (error) {
		console.error('Failed to load image:', error);
	}
};

const runEvaluation = async () => {
	toast('Running evaluation, this may take a few minutes. Please do not close the page.');
	await $fetch('/api/llm/evaluate', {
		method: 'POST',
		body: {
			id: props.character.character_id,
		},
	});
	await clientService.getCharacters();
	evaluation.value = undefined;
	await refreshEval();
	toast('Finished running evaluation.');
};

const refreshEval = async (force: boolean = false) => {
	if (evaluation.value && !force) {
		return;
	}

	try {
		evaluation.value = await $fetch<Evaluation>('/api/character/evaluation', {
			method: 'GET',
			query: {
				id: props.character.character_id,
			},
		});
		if (evaluation.value) {
			await clientService.getCharacters();
		}
	} catch (error) {
		console.error('Failed to load evaluation:', error);
	}
};

const mouseEnter = () => {
	isHovering.value = true;
};

const mouseLeave = () => {
	isHovering.value = false;
};

const showControls = computed(() => {
	return isHovering.value || settingsStore.permaControls;
});

const containerStyle = computed(() => {
	return { gridTemplateRows: '50px 40px 384px 90px' };
});

const backgroundStyles = computed(() => {
	return { backgroundImage: `url('${imageBlobUrl.value}')` };
});

onMounted(async () => {
	await fetchImage();
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<ClientOnly>
		<AlertDialog>
			<ContextMenu>
				<ContextMenuTrigger>
					<GlowBorderHover :color="['#A07CFE', '#FE8FB5', '#FFBE7B']" :border-radius="16" class="h-min w-min" @mouseenter="mouseEnter" @mouseleave="mouseLeave">
						<div class="Card-Container morph w-[256px] overflow-hidden border" :style="containerStyle" @mouseenter="refreshEval(false)">
							<div
								:class="
									cn(
										'Card-Background h-[564px] w-[256px] bg-cover bg-center bg-no-repeat opacity-0 blur-xl transition-all duration-300',
										imageLoaded ? 'showImage' : '',
										showControls ? 'showControls' : '',
										settingsStore.censorImages ? 'censor' : ''
									)
								"
								:style="backgroundStyles"></div>

							<Skeleton v-if="!imageLoaded" class="Card-Background h-[564px] w-[256px]" />

							<CharacterCardHeader :character="character" :evaluation="evaluation" :class="cn('Card-Header', showControls ? 'showControls' : '')" />

							<div :class="cn('Card-Body', showControls ? 'showControls' : '')">
								<Skeleton v-if="!imageLoaded" class="h-full w-full" />
								<img
									:src="imageBlobUrl"
									loading="lazy"
									crossorigin="use-credentials"
									alt="Character Image"
									:class="cn('h-[384px] w-[256px] object-cover', imageLoaded ? 'showImage' : '', settingsStore.censorImages ? 'censor' : '')" />
							</div>

							<CharacterCardFooter
								:class="cn('Card-Footer', showControls ? 'showControls' : '')"
								:character="character"
								:downloading="downloading"
								@visibility="updateVisibility"
								@download="downloadCharacter"
								@edit="editCharacter"
								@delete="deleteCharacter"
								@prefetch="prefetchCharacter" />
						</div>
					</GlowBorderHover>
				</ContextMenuTrigger>
				<ContextMenuContent class="max-w-[192px]">
					<ContextMenuLabel class="overflow-hidden text-ellipsis whitespace-nowrap">Actions for {{ character.character_name }}</ContextMenuLabel>
					<ContextMenuSeparator />
					<ContextMenuItem class="mb-1" @click="downloadCharacter">
						<div class="flex w-full flex-nowrap items-center gap-2">
							<Icon name="lucide:download" size="1.25rem" />
							<span>Download</span>
						</div>
					</ContextMenuItem>
					<ContextMenuItem v-if="character.owned" class="mb-1" @click="editCharacter">
						<div class="flex w-full flex-nowrap items-center gap-2">
							<Icon name="lucide:notebook-pen" size="1.25rem" />
							<span>Edit</span>
						</div>
					</ContextMenuItem>
					<AlertDialogTrigger as-child>
						<ContextMenuItem v-if="character.owned" class="bg-red-500/20 hover:bg-red-500/50 dark:hover:bg-red-500/50">
							<div class="flex w-full flex-nowrap items-center gap-2">
								<Icon name="lucide:shredder" size="1.25rem" />
								<span>Delete</span>
							</div>
						</ContextMenuItem>
					</AlertDialogTrigger>
					<ContextMenuSeparator />
					<ContextMenuItem v-if="character.owned" @click="runEvaluation">
						<div class="flex w-full flex-nowrap items-center gap-2">
							<Icon name="lucide:graduation-cap" size="1.25rem" />
							<span>Run Evaluation</span>
						</div>
					</ContextMenuItem>
					<ContextMenuItem v-if="character.owned" @click="refreshEval(true)">
						<div class="flex w-full flex-nowrap items-center gap-2">
							<Icon name="lucide:refresh-cw" size="1.25rem" />
							<span>Refresh Evaluation</span>
						</div>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription> This action cannot be undone. This will permanently delete the character and all its data from our servers. </AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Continue</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	</ClientOnly>
</template>

<style scoped>
.Card-Container {
	display: grid;
	grid-template-columns: 1fr;
	grid-auto-flow: row;
	border-radius: calc(var(--radius) + 4px);
}

.Card-Transition {
	transition-property: all;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
}

.Card-Background {
	grid-area: 1 / 1 / 5 / 2;
	transition-property: all;
	transition-timing-function: linear;
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
	filter: blur(0);
	opacity: 0;

	&.showControls {
		filter: blur(24px);
	}

	&.showImage {
		opacity: 1;

		@starting-style {
			opacity: 0;
		}
	}
}

.Card-Image {
	transition-property: all;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
	opacity: 0;

	&.showImage,
	&.showControls {
		opacity: 1;

		@starting-style {
			opacity: 0;
		}
	}
}

.Card-Body {
	grid-area: 3 / 1 / 4 / 2;
	transition-property: all;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
	display: none;
	transform: scale(1.47);

	&.showControls {
		display: block;
		transform: scale(1);

		@starting-style {
			transform: scale(1.46);
		}
	}
}

.Card-Header {
	grid-area: 1 / 1 / 3 / 2;
	transition-property: all;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
	display: none;
	opacity: 0;
	transform: translateY(-100%);

	&.showControls {
		display: block;
		opacity: 1;
		transform: translateY(0%);

		@starting-style {
			opacity: 0;
			transform: translateY(-100%);
		}
	}
}

.Card-Footer {
	transition-property: all;
	transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	transition-duration: 300ms;
	transition-behavior: allow-discrete;
	display: none;
	opacity: 0;
	transform: translateY(100%);

	&.showControls {
		display: grid;
		opacity: 1;
		transform: translateY(0%);

		@starting-style {
			opacity: 0;
			transform: translateY(100%);
		}
	}
}
</style>
