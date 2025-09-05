<script setup lang="ts">
import { toast } from 'vue-sonner';
import { cn } from '~~/lib/utils';

const props = defineProps<{
	character: Character;
}>();

const appStore = useAppStore();
const settingsStore = useSettingsStore();
const characterStore = useCharacterStore();

const downloading = ref(false);
const imageLoaded = ref(false);
const showEvaluation = ref(false);

const evaluation = ref<Evaluation | undefined>();
const imageBlobUrl = ref<string>('');

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');

const downloadCharacter = async () => {
	downloading.value = true;
	await characterStore.downloadCharacter(props.character.character_id);
	downloading.value = false;
};

const updateVisibility = async () => {
	await characterStore.updateVisibility(props.character.character_id, !props.character.public_visible);
};

const deleteCharacter = async () => {
	await characterStore.deleteCharacter(props.character.character_id);
};

const editCharacter = async () => {
	appStore.showOverlay = true;
	await navigateTo({
		path: `/character/${props.character.character_id}`,
	});
};

const fetchImage = async () => {
	try {
		const response = await fetch(`/api/image/thumb/${props.character.character_id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch image');
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
	await characterStore.fetch(false);
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
			await characterStore.fetch(false);
		}
	} catch (error) {
		console.error('Failed to load evaluation:', error);
	}
};

const mouseEnter = () => {
	showEvaluation.value = true;
};

const mouseLeave = () => {
	showEvaluation.value = false;
};

const containerStyle = computed(() => {
	return { gridTemplateRows: `50px 40px 384px 90px` };
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
					<GlowBorderHover :color="['#A07CFE', '#FE8FB5', '#FFBE7B']" :border-radius="16" class="h-min w-min" @mouseenter="refreshEval">
						<div class="Card-Container morph w-[256px] overflow-hidden border" :style="containerStyle">
							<div
								:class="
									cn(
										'Card-Background h-[564px] w-[256px] bg-cover bg-center bg-no-repeat blur-xl',
										settingsStore.censorImages ? 'censor' : ''
									)
								"
								:style="backgroundStyles"></div>

							<div class="Card-Header-Title glass-background flex w-[256px] items-center justify-between gap-2 px-2">
								<h1 class="w-full truncate text-start text-xl font-bold">
									{{ settingsStore.censorNames ? replaceLettersWithHash(character.character_name) : character.character_name }}
								</h1>
								<TooltipProvider>
									<Tooltip>
										<TooltipTrigger as-child>
											<Icon name="lucide:info" size="1.5rem" class="min-w-[25px]" />
										</TooltipTrigger>
										<TooltipContent side="bottom">
											<div class="grid grid-cols-[min-content_1fr] grid-rows-3 gap-1">
												<p>Identifier:</p>
												<p class="col-start-2">{{ character.character_id }}</p>
												<p>Uploaded:</p>
												<p class="col-start-2">{{ new Date(character.upload_date).toLocaleString() }}</p>
												<p>Filename:</p>
												<p class="col-start-2">{{ `${character.character_id}.png` }}</p>
											</div>
										</TooltipContent>
									</Tooltip>
								</TooltipProvider>
							</div>

							<div
								class="Card-Header-Evaluation Evaluation-Layout glass-background flex items-center justify-center gap-1 px-2"
								@mouseenter="mouseEnter"
								@mouseleave="mouseLeave">
								<CharacterCardEvaluation :score="character.evaluation_score" class="Evaluation-Bar" />
								<Dialog>
									<DialogTrigger v-if="evaluation" as-child>
										<div
											class="Evaluation-Button focus::bg-foreground/40 z-20 flex h-6 w-full items-center justify-center rounded-full transition-colors hover:bg-foreground/20">
											<Icon
												name="lucide:message-circle-question-mark"
												size="1rem"
												:class="cn('z-10 opacity-0 transition-all transition-discrete', showEvaluation ? 'opacity-100' : '')" />
										</div>
									</DialogTrigger>
									<DialogContent
										class="border border-foreground/20 bg-background/70 p-12 shadow-xl backdrop-blur-xl sm:max-w-[50%]"
										overlay="bg-transparent">
										<DialogHeader>
											<DialogTitle>Evaluation Results</DialogTitle>
											<DialogDescription>
												Characters are evaluated by a LLM. Here you can see the individual scores and the reasoning behind them.
											</DialogDescription>
										</DialogHeader>
										<CharacterCardEvaluation
											:score="evaluation!.appearance.score"
											subtext="Appearance"
											:reason="evaluation!.appearance.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.personality.score"
											subtext="Personality"
											:reason="evaluation!.personality.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.background.score"
											subtext="Background"
											:reason="evaluation!.background.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.consistency.score"
											subtext="Consistency"
											:reason="evaluation!.consistency.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.creativeElements.score"
											subtext="Creative Elements"
											:reason="evaluation!.creativeElements.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.grammarAndSpelling.score"
											subtext="Grammar and Spelling"
											:reason="evaluation!.grammarAndSpelling.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.structure.score"
											subtext="Structure"
											:reason="evaluation!.structure.reason" />
										<CharacterCardEvaluation
											:score="evaluation!.introduction.score"
											subtext="Introduction"
											:reason="evaluation!.introduction.reason" />
									</DialogContent>
								</Dialog>
							</div>

							<div class="Card-Body">
								<Skeleton v-if="!imageLoaded" class="h-full w-full" />
								<img
									:src="imageBlobUrl"
									loading="lazy"
									crossorigin="use-credentials"
									alt="Character Image"
									:class="
										cn(
											'h-[384px] w-[256px] object-cover transition-all duration-300',
											imageLoaded ? 'opacity-100' : 'opacity-0',
											settingsStore.censorImages ? 'censor' : ''
										)
									" />
							</div>

							<CharacterCardFooter
								:character="character"
								:downloading="downloading"
								@visibility="updateVisibility"
								@download="downloadCharacter"
								@edit="editCharacter"
								@delete="deleteCharacter" />
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
							<Icon name="lucide:graduation-cap" size="1.25rem" />
							<span>Refresh Evaluation</span>
						</div>
					</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
					<AlertDialogDescription>
						This action cannot be undone. This will permanently delete the character and all its data from our servers.
					</AlertDialogDescription>
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

.Card-Background {
	grid-area: 1 / 1 / 5 / 2;
}

.Card-Body {
	grid-area: 3 / 1 / 4 / 2;
}

.Card-Header-Title {
	grid-area: 1 / 1 / 2 / 2;
	height: 50px;
}

.Card-Header-Evaluation {
	grid-area: 2 / 1 / 3 / 2;
	height: 40px;
}

.Evaluation-Layout {
	display: grid;
	grid-template-columns: 1fr 24px;
	grid-template-rows: 1fr;
}

.Evaluation-Bar {
	grid-area: 1 / 1 / 2 / 3;
}

.Evaluation-Button {
	grid-area: 1 / 2 / 2 / 3;
}
</style>
