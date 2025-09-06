<script setup lang="ts">
import dayjs from 'dayjs';
import { toast } from 'vue-sonner';
import { cn } from '~~/lib/utils';

const definition = defineModel<Definition>('definition', { required: true });

const selectedEditor = ref('general');
const jsonDump = ref<string>('');

const isLoading = ref<boolean>(false);
const showPrev = ref<boolean>(false);
const previousContent = ref<DefinitionParts>({ description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] });

const addGreeting = async () => {
	definition.value.content.data.alternate_greetings.push('');
};

const deleteAlternativeMessage = async (index: number) => {
	definition.value.content.data.alternate_greetings.splice(index, 1);
};

const getCorrection = async () => {
	showPrev.value = true;
	isLoading.value = true;
	previousContent.value = {
		description: definition.value.content.data.description,
		first_mes: definition.value.content.data.first_mes,
		personality: definition.value.content.data.personality,
		scenario: definition.value.content.data.scenario,
		alternate_greetings: definition.value.content.data.alternate_greetings,
	};
	try {
		const response = await $fetch<DefinitionParts>('/api/llm/correction', {
			method: 'POST',
			body: previousContent.value,
		});
		definition.value.content.data.description = response.description;
		definition.value.content.data.first_mes = response.first_mes;
		definition.value.content.data.personality = response.personality;
		definition.value.content.data.scenario = response.scenario;
		definition.value.content.data.alternate_greetings = response.alternate_greetings;
	} catch (err: any) {
		console.log(err);
		previousContent.value = { description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] };
		showPrev.value = false;
		isLoading.value = false;
		return;
	}
	isLoading.value = false;
};

const saveChanges = async () => {
	try {
		const response = await $fetch<responseType>('/api/character', {
			method: 'PATCH',
			body: {
				id: definition.value.character_id,
				content: definition.value.content,
			},
		});

		toast(response.message);
	} catch (err: any) {
		console.log(err);
		return;
	}
};

onMounted(async () => {
	jsonDump.value = JSON.stringify(definition.value.content, null, 4);
});
</script>

<template>
	<div class="Character-Editor-Layout h-full w-full gap-2 overflow-hidden rounded-md">
		<div class="Character-Editor-Title flex h-full w-full flex-row rounded-md bg-background">
			<Badge variant="outline" class="flex h-9 w-48 justify-center rounded-md rounded-r-none">#{{ definition.character_id }}</Badge>
			<Input v-model="definition.content.data.name" class="z-10 h-9 rounded-none border-x-0" />
			<Badge variant="outline" class="flex h-9 w-48 justify-center rounded-md rounded-l-none">
				{{ dayjs(definition.change_date).format('DD.MM.YYYY HH:mm:ss') }}
			</Badge>
		</div>
		<div class="Character-Editor-Selector flex h-9 w-full flex-row rounded-md bg-background">
			<Select v-model="selectedEditor" default-value="general">
				<SelectTrigger style="height: 100%; width: 100%">
					<SelectValue placeholder="Select an editor block" />
				</SelectTrigger>
				<SelectContent>
					<SelectLabel>Editor Blocks</SelectLabel>
					<SelectGroup>
						<SelectItem value="general">General</SelectItem>
						<SelectItem value="alternatives">Alternative Greetings</SelectItem>
						<SelectItem value="examples">Message Examples</SelectItem>
						<SelectItem value="prompts">Prompt Overrides</SelectItem>
						<SelectItem value="creator">Creator Metadata</SelectItem>
						<SelectItem value="dump">JSON Dump</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>
		</div>

		<div class="Character-Editor-Controls flex h-9 w-full flex-row flex-nowrap justify-between gap-4">
			<Button id="clear" type="submit" class="bg-background" variant="outline" @click="getCorrection">
				<Icon name="lucide:brain-circuit" size="1.5em" />
				<span>AI Editing</span>
			</Button>

			<Button id="clear" type="submit" class="bg-background" variant="default" @click="saveChanges">
				<Icon name="lucide:send" size="1.5em" />
				<span>Save Changes</span>
			</Button>
		</div>

		<div class="Character-Editor-Content h-full w-full overflow-hidden rounded-md bg-background">
			<div v-if="selectedEditor === 'general'" class="flex h-full flex-col flex-nowrap overflow-y-auto p-4">
				<div class="flex w-full justify-between">
					<Label for="description" class="mb-2 text-xl">{{ showPrev ? 'Original' : '' }} Description</Label>
					<Label for="description" class="mb-2 text-xl">{{ showPrev ? 'Edited' : '' }} Description</Label>
				</div>
				<div class="Controls-Layout mb-2 h-full grow gap-2">
					<Textarea v-if="showPrev" id="description_old" v-model="previousContent.description" spellcheck="true" class="Controls-Col1 h-full max-h-96" />
					<Textarea id="description" v-model="definition.content.data.description" spellcheck="true" :class="cn('Controls-Col2 h-full max-h-96', showPrev ? '' : 'Controls-Col3')" />
					<Transition name="fade" mode="in-out">
						<div v-if="isLoading" class="Controls-Col3 relative h-full max-h-96 w-full">
							<Skeleton class="absolute inset-0 z-10 animate-none rounded-md backdrop-blur-2xl" />
							<Skeleton class="absolute inset-0 z-0 rounded-md bg-accent-foreground/10" />
						</div>
					</Transition>
				</div>

				<div class="flex w-full justify-between">
					<Label for="first_message" class="mb-2 text-xl">{{ showPrev ? 'Original' : '' }} First Message</Label>
					<Label for="first_message" class="mb-2 text-xl">{{ showPrev ? 'Edited' : '' }} First Message</Label>
				</div>
				<div class="Controls-Layout mb-2 h-full grow gap-2">
					<Textarea v-if="showPrev" id="first_message_old" v-model="previousContent.first_mes" contenteditable="false" class="Controls-Col1 h-full max-h-96" />
					<Textarea
						id="first_message"
						v-model="definition.content.data.first_mes"
						spellcheck="true"
						class="h-full max-h-96"
						:class="cn('Controls-Col2 h-full max-h-96', showPrev ? '' : 'Controls-Col3')" />
					<Transition name="fade" mode="in-out">
						<div v-if="isLoading" class="Controls-Col3 relative h-full max-h-96 w-full">
							<Skeleton class="absolute inset-0 z-10 animate-none rounded-md backdrop-blur-2xl" />
							<Skeleton class="absolute inset-0 z-0 rounded-md bg-accent-foreground/10" />
						</div>
					</Transition>
				</div>

				<div class="flex w-full justify-between">
					<Label for="personality" class="mb-2 text-xl">{{ showPrev ? 'Original' : '' }} Personality</Label>
					<Label for="personality" class="mb-2 text-xl">{{ showPrev ? 'Edited' : '' }} Personality</Label>
				</div>
				<div class="Controls-Layout mb-2 h-full grow gap-2">
					<Textarea v-if="showPrev" id="personality_old" v-model="previousContent.personality" contenteditable="false" class="Controls-Col1 h-full max-h-96" />
					<Textarea
						id="personality"
						v-model="definition.content.data.personality"
						spellcheck="true"
						class="h-full max-h-96"
						:class="cn('Controls-Col2 h-full max-h-96', showPrev ? '' : 'Controls-Col3')" />
					<Transition name="fade" mode="in-out">
						<div v-if="isLoading" class="Controls-Col3 relative h-full max-h-96 w-full">
							<Skeleton class="absolute inset-0 z-10 animate-none rounded-md backdrop-blur-2xl" />
							<Skeleton class="absolute inset-0 z-0 rounded-md bg-accent-foreground/10" />
						</div>
					</Transition>
				</div>

				<div class="flex w-full justify-between">
					<Label for="scenario" class="mb-2 text-xl">{{ showPrev ? 'Original' : '' }} Scenario</Label>
					<Label for="scenario" class="mb-2 text-xl">{{ showPrev ? 'Edited' : '' }} Scenario</Label>
				</div>
				<div class="Controls-Layout mb-2 h-full grow gap-2">
					<Textarea v-if="showPrev" id="scenario_old" v-model="previousContent.scenario" contenteditable="false" class="Controls-Col1 h-full max-h-96" />
					<Textarea
						id="scenario"
						v-model="definition.content.data.scenario"
						spellcheck="true"
						class="h-full max-h-96"
						:class="cn('Controls-Col2 h-full max-h-96', showPrev ? '' : 'Controls-Col3')" />
					<Transition name="fade" mode="in-out">
						<div v-if="isLoading" class="Controls-Col3 relative h-full max-h-96 w-full">
							<Skeleton class="absolute inset-0 z-10 animate-none rounded-md backdrop-blur-2xl" />
							<Skeleton class="absolute inset-0 z-0 rounded-md bg-accent-foreground/10" />
						</div>
					</Transition>
				</div>
			</div>

			<div v-else-if="selectedEditor === 'alternatives'" class="flex h-full flex-col flex-nowrap p-4">
				<Label for="alt_greetings" class="my-2 text-xl">Alternative Greetings</Label>
				<Button id="save" type="submit" class="my-2" variant="secondary" @click="addGreeting">
					<span class="sr-only">Add Greeting</span>
					<Icon name="lucide:message-square-plus" size="1.5em" />
				</Button>
				<div class="flex h-full flex-col flex-nowrap overflow-y-auto">
					<div v-for="(item, index) in definition.content.data.alternate_greetings" :key="item" class="mr-2 mb-2 grid max-h-96 grid-cols-[1fr_48px] gap-2">
						<Textarea v-model="definition.content.data.alternate_greetings[index]" class="h-full" spellcheck="true" />
						<Button type="submit" variant="destructive" class="h-full p-0" @click="deleteAlternativeMessage(index)">
							<span class="sr-only">Delete</span>
							<Icon name="lucide:trash-2" size="2em" />
						</Button>
					</div>
				</div>
			</div>

			<div v-else-if="selectedEditor === 'examples'" class="flex h-full flex-col flex-nowrap p-4">
				<Label for="alt_greetings" class="mb-2 text-xl">Message Examples</Label>
				<Textarea id="examples" v-model="definition.content.data.mes_example" spellcheck="true" class="h-full" />
			</div>

			<div v-else-if="selectedEditor === 'prompts'" class="flex h-full flex-col flex-nowrap p-4">
				<div class="mb-8 h-full flex-1">
					<Label for="system_prompt" class="text-xl">System Prompt</Label>
					<Textarea id="system_prompt" v-model="definition.content.data.system_prompt" spellcheck="true" class="h-full" />
				</div>

				<div class="mb-8 h-full flex-1">
					<Label for="post_history_instructions" class="text-xl">Post History Instructions</Label>
					<Textarea id="post_history_instructions" v-model="definition.content.data.post_history_instructions" spellcheck="true" class="h-full" />
				</div>
			</div>

			<div v-else-if="selectedEditor === 'creator'" class="flex h-full flex-col flex-nowrap p-4">
				<div class="mb-8 h-full flex-1">
					<Label for="creator" class="text-xl">Creator</Label>
					<Textarea id="creator" v-model="definition.content.data.creator" spellcheck="true" class="h-full" />
				</div>

				<div class="mb-8 h-full flex-1">
					<Label for="creator_notes" class="text-xl">Creator Notes</Label>
					<Textarea id="creator_notes" v-model="definition.content.data.creator_notes" spellcheck="true" class="h-full" />
				</div>

				<div class="mb-8 h-full flex-1">
					<Label for="character_version" class="text-xl">Creator Notes</Label>
					<Textarea id="character_version" v-model="definition.content.data.character_version" spellcheck="true" class="h-full" />
				</div>

				<div class="mb-8 h-full flex-1">
					<Label for="tags" class="text-xl">Tags</Label>
					<TagsInput v-model="definition.content.data.tags" if="character_tags">
						<TagsInputItem v-for="item in definition.content.data.tags" :key="item" :value="item">
							<TagsInputItemText />
							<TagsInputItemDelete />
						</TagsInputItem>
						<TagsInputInput placeholder="Add Tag..." />
					</TagsInput>
				</div>
			</div>

			<div v-else-if="selectedEditor === 'dump'" class="flex h-full flex-col flex-nowrap p-4">
				<Label for="json" class="text-xl">JSON Dump</Label>
				<Textarea id="json" v-model="jsonDump" spellcheck="true" class="h-full" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.Character-Editor-Layout {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: min-content min-content 1fr;
	grid-template-areas: 'Title Selector' 'Controls Controls' 'Content Content';
}

.Character-Editor-Title {
	grid-area: Title;
}

.Character-Editor-Selector {
	grid-area: Selector;
}

.Character-Editor-Controls {
	grid-area: Controls;
}

.Character-Editor-Content {
	grid-area: Content;
}

.Controls-Layout {
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
	grid-auto-flow: row;
}

.Controls-Col1 {
	grid-area: 1 / 1 / 2 / 2;
}

.Controls-Col2 {
	grid-area: 1 / 2 / 2 / 3;
}

.Controls-Col3 {
	grid-area: 1 / 1 / 2 / 3;
}
</style>
