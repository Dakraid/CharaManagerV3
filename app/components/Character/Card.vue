<script setup lang="ts">
import { cn } from '~~/lib/utils';

const props = defineProps<{
	character: Character;
}>();

const settingsStore = useSettingsStore();

const isImageLoaded = ref(false);
const imageBlobUrl = ref<string>('');

const replaceLettersWithHash = (str: string): string => str.replace(/\S/g, '#');

const containerStyle = computed(() => {
	return { gridTemplateRows: `50px 40px 384px 90px` };
});

const backgroundStyles = computed(() => {
	return { backgroundImage: `url('${imageBlobUrl.value}')` };
});

const fetchImage = async () => {
	try {
		const response = await fetch(`/api/image/thumb/${props.character.character_id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch image');
		}

		const blob = await response.blob();
		imageBlobUrl.value = URL.createObjectURL(blob);
		isImageLoaded.value = true;
	} catch (error) {
		console.error('Failed to load image:', error);
	}
};

onMounted(() => {
	fetchImage();
});

onUnmounted(() => {
	if (imageBlobUrl.value) {
		URL.revokeObjectURL(imageBlobUrl.value);
	}
});
</script>

<template>
	<ClientOnly>
		<GlowBorderHover :color="['#A07CFE', '#FE8FB5', '#FFBE7B']" :border-radius="16" class="h-min w-min">
			<div class="Card-Container morph w-[256px] overflow-hidden border" :style="containerStyle">
				<div
					:class="cn('Card-Background h-[564px] w-[256px] bg-cover bg-center bg-no-repeat blur-xl', settingsStore.censorImages ? 'censor' : '')"
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

				<div class="Card-Header-Evaluation glass-background flex items-center justify-center px-2">
					<CharacterCardEvaluation :score="character.evaluation_score" />
				</div>

				<div class="Card-Body">
					<Skeleton v-if="!isImageLoaded" class="h-full w-full" />
					<img
						:src="imageBlobUrl"
						loading="lazy"
						crossorigin="use-credentials"
						alt="Character Image"
						:class="
							cn(
								'h-[384px] w-[256px] object-cover transition-all duration-300',
								isImageLoaded ? 'opacity-100' : 'opacity-0',
								settingsStore.censorImages ? 'censor' : ''
							)
						" />
				</div>

				<CharacterCardFooter :character="character" />
			</div>
		</GlowBorderHover>
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
</style>
