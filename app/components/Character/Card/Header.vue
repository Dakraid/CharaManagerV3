<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineProps<{
	character: Character;
	evaluation?: Evaluation;
}>();

const showControls = ref(true);
const settingsStore = useSettingsStore();

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');
</script>

<template>
	<div class="Header glass-background">
		<div class="Title flex w-[256px] items-center justify-between gap-2 px-2">
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

		<div class="Evaluation Evaluation-Layout items-center justify-center gap-1 px-2">
			<CharacterCardEvaluation :score="character.evaluation_score" class="Evaluation-Bar" />
			<Dialog>
				<DialogTrigger v-if="evaluation" as-child>
					<div class="Evaluation-Button focus::bg-foreground/40 z-20 flex h-6 w-full items-center justify-center rounded-full transition-colors hover:bg-foreground/20">
						<Icon name="lucide:message-circle-question-mark" size="1rem" :class="cn('z-10 opacity-0 transition-all transition-discrete duration-500', showControls ? 'opacity-100' : '')" />
					</div>
				</DialogTrigger>
				<DialogContent class="border border-foreground/20 bg-background/70 p-12 shadow-xl backdrop-blur-xl sm:max-w-[50%]" overlay="bg-transparent">
					<DialogHeader>
						<DialogTitle>Evaluation Results</DialogTitle>
						<DialogDescription> Characters are evaluated by a LLM. Here you can see the individual scores and the reasoning behind them. </DialogDescription>
					</DialogHeader>
					<CharacterCardEvaluation :score="evaluation!.appearance.score" subtext="Appearance" :reason="evaluation!.appearance.reason" />
					<CharacterCardEvaluation :score="evaluation!.personality.score" subtext="Personality" :reason="evaluation!.personality.reason" />
					<CharacterCardEvaluation :score="evaluation!.background.score" subtext="Background" :reason="evaluation!.background.reason" />
					<CharacterCardEvaluation :score="evaluation!.consistency.score" subtext="Consistency" :reason="evaluation!.consistency.reason" />
					<CharacterCardEvaluation :score="evaluation!.creativeElements.score" subtext="Creative Elements" :reason="evaluation!.creativeElements.reason" />
					<CharacterCardEvaluation :score="evaluation!.grammarAndSpelling.score" subtext="Grammar and Spelling" :reason="evaluation!.grammarAndSpelling.reason" />
					<CharacterCardEvaluation :score="evaluation!.structure.score" subtext="Structure" :reason="evaluation!.structure.reason" />
					<CharacterCardEvaluation :score="evaluation!.introduction.score" subtext="Introduction" :reason="evaluation!.introduction.reason" />
				</DialogContent>
			</Dialog>
		</div>
	</div>
</template>

<style scoped>
.Header {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 50px 40px;
	gap: 0;
	grid-auto-flow: row;
	grid-auto-columns: 1fr;
	grid-auto-rows: 1fr;
	justify-items: stretch;
	align-items: stretch;
	justify-content: stretch;
}

.Title {
	height: 50px;
}

.Evaluation {
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
