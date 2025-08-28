<script setup lang="ts">
import dayjs from 'dayjs';

const definition = defineModel<Definition>('definition', { required: true });

const selectedEditor = ref('general');
const jsonDump = ref<string>('');
const previousContent = ref<{
	description: string;
	first_mes: string;
	personality: string;
	scenario: string;
	alternate_greetings: string[];
}>({ description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] });

async function addGreeting() {
	definition.value.content.alternate_greetings.push('');
}

async function deleteAlternativeMessage(index: number) {
	definition.value.content.data.alternate_greetings.splice(index, 1);
}

async function setContentHeight() {
	if (selectedEditor.value === 'alternatives') {
		await nextTick();
		const scrollElement = document.getElementById('alt_greetings');
		if (scrollElement) {
			const parentElement = scrollElement.parentElement;

			if (parentElement) {
				scrollElement.style.maxHeight = `${parentElement.offsetHeight - 100}px`;
			}
		}

		return;
	}

	if (selectedEditor.value === 'general') {
		await nextTick();
		const scrollElement = document.getElementById('general');
		if (scrollElement) {
			const parentElement = scrollElement.parentElement;

			if (parentElement) {
				scrollElement.style.maxHeight = `${parentElement.offsetHeight}px`;
			}
		}

		return;
	}
}

// async function navigateHome() {
// 	await navigateTo({
// 		path: `/`,
// 	});
// }

// async function saveActiveDefinition() {
// 	characterStore.isFetching = true;
// 	try {
// 		await useFetch('/api/defs/definition', {
// 			method: 'PATCH',
// 			body: {
// 				id: characterStore.loadedCharacter!.character.id,
// 				definition: JSON.stringify(characterStore.loadedCharacter!.definition),
// 			},
// 		});
// 	} catch (err: any) {
// 		toast({
// 			title: 'Failed to save definition',
// 			description: err.message,
// 			variant: 'destructive',
// 		});
//
// 		characterStore.isFetching = false;
// 		return;
// 	}
//
// 	toast({
// 		title: 'Success',
// 		description: 'Definition was updated.',
// 	});
//
// 	previousContent.value = { description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] };
// 	characterStore.isFetching = false;
// }
//
// async function deleteActiveCharacter() {
// 	await deleteCharacter(characterStore.loadedCharacter!.character);
// 	await navigateHome();
// }

// async function llmEdit(source: string, content: string, type: number, source_index: number = 0) {
// 	const response = await $fetch<{ source: string; content: string }>('/api/llm/edit', {
// 		method: 'POST',
// 		body: {
// 			source: source,
// 			content: content,
// 			type: type,
// 		},
// 	});
//
// 	if (!response?.content) {
// 		return undefined;
// 	}
//
// 	switch (source) {
// 		case 'description':
// 			previousContent.value.description = content;
// 			break;
// 		case 'first_mes':
// 			previousContent.value.first_mes = content;
// 			break;
// 		case 'personality':
// 			previousContent.value.personality = content;
// 			break;
// 		case 'scenario':
// 			previousContent.value.scenario = content;
// 			break;
// 		case 'alternate_greetings':
// 			previousContent.value.alternate_greetings[source_index] = content;
// 			break;
// 	}
// 	return response.content;
// }
//
// async function generalLlmEdit() {
// 	characterStore.isFetching = true;
// 	const newDesc = await llmEdit('description', definition.content.data.description, 1);
// 	if (newDesc) {
// 		definition.content.data.description = newDesc;
// 	}
//
// 	if (definition.content.data.first_mes.trim().length > 10) {
// 		const newFirstMes = await llmEdit('first_mes', definition.content.data.first_mes, 2);
// 		if (newFirstMes) {
// 			definition.content.data.first_mes = newFirstMes;
// 		}
// 	}
//
// 	if (definition.content.data.personality.trim().length > 10) {
// 		const newPersonality = await llmEdit('personality', definition.content.data.personality, 1);
// 		if (newPersonality) {
// 			definition.content.data.description = newPersonality;
// 		}
// 	}
//
// 	if (definition.content.data.scenario.trim().length > 10) {
// 		const newScenario = await llmEdit('scenario', definition.content.data.scenario, 1);
// 		if (newScenario) {
// 			definition.content.data.scenario = newScenario;
// 		}
// 	}
// 	characterStore.isFetching = false;
// }

onMounted(async () => {
	jsonDump.value = JSON.stringify(definition.value.content, null, 4);
	await setContentHeight();
	window.addEventListener('resize', async () => await setContentHeight());
});
</script>

<template>
	<Card class="flex h-full w-full flex-col">
		<CardHeader class="flex flex-col p-6 pb-0">
			<CardTitle class="flex h-full w-full flex-row">
				<Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-r-none">#{{ definition.character_id }}</Badge>
				<Input v-model="definition.content.data.name" class="z-10 h-full rounded-none border-x-0" />
				<Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-l-none">
					{{ dayjs(definition.change_date).format('DD.MM.YYYY HH:mm:ss') }}
				</Badge>
			</CardTitle>
			<CardDescription class="w-full">
				<Select v-model="selectedEditor" default-value="general">
					<SelectTrigger class="w-full">
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
			</CardDescription>
		</CardHeader>
		<CardContent class="mr-6 h-full overflow-y-auto">
			<div v-if="selectedEditor === 'general'" class="flex flex-col flex-nowrap gap-8 rounded-md border p-2 pb-11">
				<div class="relative h-96">
					<Label for="description" class="text-xl">Description</Label>
					<div class="flex h-full w-full flex-row gap-2">
						<Textarea id="description" v-model="definition.content.data.description" spellcheck="true" class="h-full w-full" />
						<Textarea
							v-if="previousContent.description.trim().length > 10"
							id="description_old"
							v-model="previousContent.description"
							spellcheck="true"
							class="h-full w-full" />
					</div>
				</div>

				<div class="relative h-96">
					<Label for="first_message" class="text-xl">First Message</Label>
					<div class="flex h-full w-full flex-row gap-2">
						<Textarea id="first_message" v-model="definition.content.data.first_mes" spellcheck="true" class="h-full" />
						<Textarea
							v-if="previousContent.first_mes.trim().length > 10"
							id="first_message_old"
							v-model="previousContent.first_mes"
							contenteditable="false"
							class="h-full w-full" />
					</div>
				</div>

				<div class="relative h-96">
					<Label for="personality" class="text-xl">Personality</Label>
					<div class="flex h-full w-full flex-row gap-2">
						<Textarea id="personality" v-model="definition.content.data.personality" spellcheck="true" class="h-full" />
						<Textarea
							v-if="previousContent.personality.trim().length > 10"
							id="personality_old"
							v-model="previousContent.personality"
							contenteditable="false"
							class="h-full w-full" />
					</div>
				</div>

				<div class="relative h-96">
					<Label for="scenario" class="text-xl">Scenario</Label>
					<div class="flex h-full w-full flex-row gap-2">
						<Textarea id="scenario" v-model="definition.content.data.scenario" spellcheck="true" class="h-full" />
						<Textarea
							v-if="previousContent.scenario.trim().length > 10"
							id="scenario_old"
							v-model="previousContent.scenario"
							contenteditable="false"
							class="h-full w-full" />
					</div>
				</div>
			</div>
			<ScrollArea v-else-if="selectedEditor === 'alternatives'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
				<Label for="alt_greetings" class="my-2 text-xl">Alternative Greetings</Label>
				<Button id="save" type="submit" class="my-2" variant="secondary" @click="addGreeting">
					<span class="sr-only">Add Greeting</span>
					<Icon name="lucide:message-square-plus" size="1.5em" />
				</Button>
				<ScrollArea id="alt_greetings" class="height-fix">
					<div v-for="(item, index) in definition.content.data.alternate_greetings" :key="item" class="mb-2 grid h-full grid-cols-[1fr_48px] gap-2">
						<Textarea v-model="definition.content.data.alternate_greetings[index]" class="h-full" spellcheck="true" />
						<Button type="submit" variant="destructive" class="h-full p-0" @click="deleteAlternativeMessage(index)">
							<span class="sr-only">Delete</span>
							<Icon name="lucide:trash-2" size="2em" />
						</Button>
					</div>
				</ScrollArea>
			</ScrollArea>
			<ScrollArea v-else-if="selectedEditor === 'examples'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
				<Label for="alt_greetings" class="mb-2 text-xl">Message Examples</Label>
				<Textarea id="examples" v-model="definition.content.data.mes_example" spellcheck="true" class="h-full" />
			</ScrollArea>
			<ScrollArea v-else-if="selectedEditor === 'prompts'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
				<div class="mb-8 h-full flex-1">
					<Label for="system_prompt" class="text-xl">System Prompt</Label>
					<Textarea id="system_prompt" v-model="definition.content.data.system_prompt" spellcheck="true" class="h-full" />
				</div>

				<div class="mb-8 h-full flex-1">
					<Label for="post_history_instructions" class="text-xl">Post History Instructions</Label>
					<Textarea id="post_history_instructions" v-model="definition.content.data.post_history_instructions" spellcheck="true" class="h-full" />
				</div>
			</ScrollArea>
			<ScrollArea v-else-if="selectedEditor === 'creator'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
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
			</ScrollArea>
			<ScrollArea v-else-if="selectedEditor === 'dump'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
				<div class="mb-8 h-full flex-1">
					<Label for="json" class="text-xl">JSON Dump</Label>
					<Textarea id="json" v-model="jsonDump" spellcheck="true" class="h-full" />
				</div>
			</ScrollArea>
		</CardContent>
		<CardFooter>
			<div class="flex w-full items-center justify-between gap-8">
				<Button type="submit" variant="destructive" class="max-w-32 grow">
					<span class="sr-only">Delete</span>
					<Icon name="lucide:trash-2" size="1.5em" />
				</Button>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger class="max-w-32 grow">
							<Button type="submit" variant="secondary" class="w-full">
								<span class="sr-only">Edit</span>
								<Icon name="lucide:brain-circuit" size="1.5em" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<div class="flex justify-between gap-2">
								<p>This actions tries to improve the given text using AI.</p>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Button type="submit" variant="secondary" class="max-w-32 grow">
					<span class="sr-only">Save</span>
					<Icon name="lucide:send-horizontal" size="1.5em" />
				</Button>
			</div>
		</CardFooter>
	</Card>
</template>

<style scoped></style>
