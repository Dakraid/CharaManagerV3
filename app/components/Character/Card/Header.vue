<script setup lang="ts">
const props = defineProps<{
	character: Character;
	width: number;
	censored: boolean;
}>();
</script>

<template>
	<div class="Header glass-background flex items-center justify-between gap-2 px-2" :style="widthClamp">
		<h1 class="w-full truncate text-start text-xl font-bold">
			{{ censored ? replaceLettersWithHash(character.character_name) : character.character_name }}
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
	<div class="Evaluation glass-background flex items-center justify-center px-2">
		<CharacterCardEvaluation :score="character.evaluation_score" />
	</div>
</template>

<style scoped>
.Header {
	grid-area: 1 / 1 / 2 / 2;
	height: 50px;
}

.Evaluation {
	grid-area: 2 / 1 / 3 / 2;
	height: 40px;
}
</style>
