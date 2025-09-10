<script setup lang="ts">
import { safeDestr } from 'destr';
import { diffWordsWithSpace } from 'diff';

const activeCompare = ref<boolean>(false);
const prioritizedOrder = ref<string>('left');

const leftBundle = ref<ChatCompletionPresetBundle>();
const rightBundle = ref<ChatCompletionPresetBundle>();

const origLeftBundle = ref<ChatCompletionPresetBundle>();
const origRightBundle = ref<ChatCompletionPresetBundle>();

const alignedLeftBundle = ref<ChatCompletionPresetBundle | undefined>();
const alignedRightBundle = ref<ChatCompletionPresetBundle | undefined>();

const leftPromptOrder = ref<PromptOrder | undefined>();
const rightPromptOrder = ref<PromptOrder | undefined>();

const leftScrollEl = ref<HTMLDivElement | null>(null);
const leftScrollState = useScroll(leftScrollEl);

const rightScrollEl = ref<HTMLDivElement | null>(null);
const rightScrollState = useScroll(rightScrollEl);

const isSyncingScroll = ref(false);
const syncEnabled = computed(() => leftPromptOrder.value?.character_id === 999999 && rightPromptOrder.value?.character_id === 999999);

const loadPreset = async (position: number) => {
	return new Promise<void>((resolve) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'application/json,.json';

		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) {
				resolve();
				return;
			}
			try {
				const text = await file.text();
				JSON.parse(text);

				switch (position) {
					case 0:
						leftBundle.value = {
							title: file.name.replace('.json', ''),
							presetJSON: text,
							presetParsed: safeDestr<ChatCompletionPreset>(text),
						};
						origLeftBundle.value = {
							title: file.name.replace('.json', ''),
							presetJSON: text,
							presetParsed: safeDestr<ChatCompletionPreset>(text),
						};
						leftPromptOrder.value = getLargestPromptOrder(leftBundle.value.presetParsed.prompt_order);
						alignedLeftBundle.value = leftBundle.value;
						break;
					case 1:
						rightBundle.value = {
							title: file.name.replace('.json', ''),
							presetJSON: text,
							presetParsed: safeDestr<ChatCompletionPreset>(text),
						};
						origRightBundle.value = {
							title: file.name.replace('.json', ''),
							presetJSON: text,
							presetParsed: safeDestr<ChatCompletionPreset>(text),
						};
						rightPromptOrder.value = getLargestPromptOrder(rightBundle.value.presetParsed.prompt_order);
						alignedRightBundle.value = rightBundle.value;
						break;
				}
			} catch (err) {
				console.error('Invalid JSON file selected:', err);
			} finally {
				resolve();
			}
		};

		input.click();
	});
};

function runDiff(leftPrompt: Prompt, rightPrompt: Prompt) {
	if (!leftPrompt.content || !rightPrompt.content) {
		return;
	}

	const diff = diffWordsWithSpace(leftPrompt.content, rightPrompt.content);

	leftPrompt.diffParts = diff
		.filter((part) => !part.added)
		.map((part) => ({
			value: part.value,
			color: part.removed ? 'green' : 'grey',
		})) as DiffPart[];

	rightPrompt.diffParts = diff
		.filter((part) => !part.removed)
		.map((part) => ({
			value: part.value,
			color: part.added ? 'red' : 'grey',
		})) as DiffPart[];
}

const runCompare = async () => {
	if (!leftBundle.value || !rightBundle.value) {
		console.error('Both bundles must be loaded before comparing.');
		return;
	}

	alignedLeftBundle.value = leftBundle.value;
	alignedRightBundle.value = rightBundle.value;

	leftPromptOrder.value = getLargestPromptOrder(alignedLeftBundle.value.presetParsed.prompt_order);
	rightPromptOrder.value = getLargestPromptOrder(alignedRightBundle.value.presetParsed.prompt_order);

	if (!leftPromptOrder.value?.order || !rightPromptOrder.value?.order) {
		console.error('One or both bundles do not have a valid prompt order.');
		return;
	}

	const alignedOrders = alignOrders(leftPromptOrder.value.order, rightPromptOrder.value.order, prioritizedOrder.value);
	alignedLeftBundle.value.presetParsed.prompt_order = [{ character_id: 999999, order: alignedOrders.left }];
	leftPromptOrder.value = getLargestPromptOrder(alignedLeftBundle.value.presetParsed.prompt_order);
	alignedRightBundle.value.presetParsed.prompt_order = [{ character_id: 999999, order: alignedOrders.right }];
	rightPromptOrder.value = getLargestPromptOrder(alignedRightBundle.value.presetParsed.prompt_order);

	for (const leftPrompt of alignedLeftBundle.value.presetParsed.prompts) {
		const rightPrompt = alignedRightBundle.value.presetParsed.prompts.find((p) => p.identifier === leftPrompt.identifier);
		if (rightPrompt) {
			runDiff(leftPrompt, rightPrompt);
		}
	}

	activeCompare.value = true;
};

const clearCompare = () => {
	if (!origLeftBundle.value || !origRightBundle.value) {
		console.error('Both bundles must be loaded before comparing.');
		return;
	}

	alignedLeftBundle.value = undefined;
	alignedRightBundle.value = undefined;

	leftBundle.value = origLeftBundle.value;
	rightBundle.value = origRightBundle.value;

	leftPromptOrder.value = getLargestPromptOrder(leftBundle.value.presetParsed.prompt_order);
	rightPromptOrder.value = getLargestPromptOrder(rightBundle.value.presetParsed.prompt_order);

	for (const leftPrompt of leftBundle.value.presetParsed.prompts) {
		leftPrompt.diffParts = undefined;
	}

	for (const rightPrompt of rightBundle.value.presetParsed.prompts) {
		rightPrompt.diffParts = undefined;
	}

	activeCompare.value = false;
};

const updateLeftScrollState = () => {
	if (!syncEnabled.value) return;
	if (isSyncingScroll.value) return;

	isSyncingScroll.value = true;
	rightScrollState.y.value = leftScrollState.y.value;
	isSyncingScroll.value = false;
};

const updateRightScrollState = () => {
	if (!syncEnabled.value) return;
	if (isSyncingScroll.value) return;

	isSyncingScroll.value = true;
	leftScrollState.y.value = rightScrollState.y.value;
	isSyncingScroll.value = false;
};
</script>

<template>
	<div class="Compare-Layout h-full w-full gap-2 overflow-hidden px-4">
		<div class="Compare-Controls flex h-16 items-center justify-center gap-4 rounded-md border bg-background">
			<Button
				variant="secondary"
				@click="
					() => {
						prioritizedOrder = 'left';
					}
				">
				<Icon name="lucide:arrow-left" size="1.5rem" />
				<span class="ml-2">Prioritize Left Order</span>
			</Button>
			<Button v-if="activeCompare" variant="secondary" @click="clearCompare">
				<Icon name="lucide:eraser" size="1.5rem" />
				<span class="ml-2">Clear Compare</span>
			</Button>
			<Button v-else variant="secondary" @click="runCompare">
				<Icon name="lucide:arrow-left-right" size="1.5rem" />
				<span class="ml-2">Run Compare</span>
			</Button>
			<Button
				variant="secondary"
				@click="
					() => {
						prioritizedOrder = 'right';
					}
				">
				<Icon name="lucide:arrow-right" size="1.5rem" />
				<span class="ml-2">Prioritize Right Order</span>
			</Button>
		</div>

		<div class="Compare-Left flex flex-col gap-2 overflow-hidden">
			<div class="flex flex-row items-center rounded-md border bg-background p-2">
				<Button variant="secondary" @click="loadPreset(0)">
					<Icon name="lucide:upload" size="1.5rem" />
					<span class="sr-only">Upload</span>
				</Button>
				<h1 class="w-full grow text-center text-2xl font-bold">{{ leftBundle?.title ?? 'Left' }}</h1>
				<h1 class="text-right text-lg text-nowrap text-muted-foreground">Order ID: {{ leftPromptOrder?.character_id ?? 'None' }}</h1>
			</div>
			<div v-if="leftBundle" ref="leftScrollEl" class="flex flex-col gap-4 overflow-y-auto rounded-md border border-r-0 bg-background p-4" @scroll="updateLeftScrollState">
				<PresetBlock v-for="prompt in activeCompare ? alignedLeftBundle?.presetParsed.prompts : origLeftBundle?.presetParsed.prompts" :key="'l_' + prompt.identifier" :prompt="prompt" />
			</div>
		</div>

		<Separator orientation="vertical" class="Compare-Separator mx-2" />

		<div class="Compare-Right flex flex-col gap-2 overflow-hidden">
			<div class="flex flex-row items-center rounded-md border bg-background p-2">
				<Button variant="secondary" @click="loadPreset(1)">
					<Icon name="lucide:upload" size="1.5rem" />
					<span class="sr-only">Upload</span>
				</Button>
				<h1 class="w-full grow text-center text-2xl font-bold">{{ rightBundle?.title ?? 'Right' }}</h1>
				<h1 class="text-right text-lg text-nowrap text-muted-foreground">Order ID: {{ rightPromptOrder?.character_id ?? 'None' }}</h1>
			</div>
			<div v-if="rightBundle" ref="rightScrollEl" class="flex flex-col gap-4 overflow-y-auto rounded-md border border-r-0 bg-background p-4" @scroll="updateRightScrollState">
				<PresetBlock v-for="prompt in activeCompare ? alignedRightBundle?.presetParsed.prompts : origRightBundle?.presetParsed.prompts" :key="'r_' + prompt.identifier" :prompt="prompt" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.Compare-Layout {
	display: grid;
	grid-template-columns: 1fr min-content 1fr;
	grid-template-rows: min-content 1fr;
	grid-auto-flow: row;
}

.Compare-Left {
	grid-area: 2 / 1 / 3 / 2;
}

.Compare-Right {
	grid-area: 2 / 3 / 3 / 4;
}

.Compare-Background {
	grid-area: 1 / 1 / 3 / 4;
}

.Compare-Separator {
	grid-area: 2 / 2 / 3 / 3;
}

.Compare-Controls {
	grid-area: 1 / 1 / 2 / 4;
}
</style>
