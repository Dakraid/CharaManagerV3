<script setup lang="ts">
import dayjs from 'dayjs';

const definition = defineModel<Definition>('definition', { required: true });

const selectedEditor = ref('general');
const jsonDump = ref(JSON.stringify(definition.value.content, null, 4));

const previousContent = ref<{
	description: string;
	first_mes: string;
	personality: string;
	scenario: string;
	alternate_greetings: string[];
}>({ description: '', first_mes: '', personality: '', scenario: '', alternate_greetings: [] });

// async function navigateHome() {
// 	await navigateTo({
// 		path: `/`,
// 	});
// }

async function addGreeting() {
	definition.value.content.alternate_greetings.push('');
}

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
	await setContentHeight();
	window.addEventListener('resize', async () => await setContentHeight());
});
</script>

<template>
	<Card class="flex h-full max-h-[calc(100vh_-_theme(spacing.16))] w-full flex-col">
		<CardHeader class="flex flex-col p-6 pb-0">
			<CardTitle class="flex flex-row">
				<Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-r-none">#{{ definition.character_id }}</Badge>
				<Input v-model="definition.content.name" class="z-10 rounded-none border-x-0" />
				<Badge variant="outline" class="flex h-10 w-48 justify-center rounded-md rounded-l-none">
					{{ dayjs(definition.change_date).format('DD.MM.YYYY HH:mm:ss') }}
				</Badge>
			</CardTitle>
			<CardDescription>
				<Select v-model="selectedEditor" default-value="general">
					<SelectTrigger>
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
		<CardContent class="flex h-full items-center justify-center overflow-hidden px-6 py-2">
			<Transition name="fade" mode="out-in">
				<ScrollArea v-if="selectedEditor === 'general'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
					<div class="mb-8 h-full flex-1">
						<Label for="description" class="mb-4 text-xl">Description</Label>
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

					<div class="mb-8 h-full flex-1">
						<Label for="first_message" class="mb-4 text-xl">First Message</Label>
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

					<div class="mb-8 h-full flex-1">
						<Label for="personality" class="mb-4 text-xl">Personality</Label>
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

					<div class="mb-8 h-full flex-1">
						<Label for="scenario" class="mb-4 text-xl">Scenario</Label>
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
				</ScrollArea>
				<ScrollArea v-else-if="selectedEditor === 'alternatives'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
					<Label for="alt_greetings" class="my-2 text-xl">Alternative Greetings</Label>
					<Button id="save" type="submit" variant="outline" class="my-2" @click="addGreeting">
						<span class="sr-only">Add Greeting</span>
						<Icon name="lucide:message-square-plus" class="h-6 w-6" />
					</Button>
					<ScrollArea id="alt_greetings" class="height-fix">
						<div
							v-for="(item, index) in definition.content.data.alternate_greetings"
							:key="item"
							class="mb-2 grid h-full grid-cols-[1fr_48px] gap-2">
							<Textarea v-model="definition.content.data.alternate_greetings[index]" class="h-full" spellcheck="true" />
							<Button
								type="submit"
								variant="outline"
								class="h-full border-destructive p-0 text-destructive-foreground hover:bg-destructive/20"
								@click="deleteAlternativeMessage(index)">
								<span class="sr-only">Delete</span>
								<Icon name="lucide:trash-2" class="h-6 w-6 stroke-destructive" />
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
						<Label for="system_prompt" class="mb-4 text-xl">System Prompt</Label>
						<Textarea id="system_prompt" v-model="definition.content.data.system_prompt" spellcheck="true" class="h-full" />
					</div>

					<div class="mb-8 h-full flex-1">
						<Label for="post_history_instructions" class="mb-4 text-xl">Post History Instructions</Label>
						<Textarea id="post_history_instructions" v-model="definition.content.data.post_history_instructions" spellcheck="true" class="h-full" />
					</div>
				</ScrollArea>
				<ScrollArea v-else-if="selectedEditor === 'creator'" class="height-fix flex h-full w-full flex-col gap-8 rounded-md border p-3 pr-6">
					<div class="mb-8 h-full flex-1">
						<Label for="creator" class="mb-4 text-xl">Creator</Label>
						<Textarea id="creator" v-model="definition.content.data.creator" spellcheck="true" class="h-full" />
					</div>

					<div class="mb-8 h-full flex-1">
						<Label for="creator_notes" class="mb-4 text-xl">Creator Notes</Label>
						<Textarea id="creator_notes" v-model="definition.content.data.creator_notes" spellcheck="true" class="h-full" />
					</div>

					<div class="mb-8 h-full flex-1">
						<Label for="character_version" class="mb-4 text-xl">Creator Notes</Label>
						<Textarea id="character_version" v-model="definition.content.data.character_version" spellcheck="true" class="h-full" />
					</div>

					<div class="mb-8 h-full flex-1">
						<Label for="tags" class="mb-4 text-xl">Tags</Label>
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
						<Label for="json" class="mb-4 text-xl">JSON Dump</Label>
						<Textarea id="json" v-model="jsonDump" spellcheck="true" class="h-full" />
					</div>
				</ScrollArea>
			</Transition>
		</CardContent>
		<CardFooter>
			<div class="flex w-full items-center justify-between">
				<Button type="submit" variant="destructive">
					<span class="sr-only">Delete</span>
					<Icon name="lucide:trash-2" class="h-6 w-24" />
				</Button>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Button type="submit" variant="secondary">
								<span class="sr-only">Edit</span>
								<Icon name="lucide:brain-circuit" class="h-6 w-24" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="bottom">
							<div class="flex justify-between gap-2">
								<p>This actions tries to improve the given text using AI.</p>
							</div>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
				<Button type="submit" variant="secondary">
					<span class="sr-only">Save</span>
					<Icon name="lucide:send-horizontal" class="h-6 w-24" />
				</Button>
			</div>
		</CardFooter>
	</Card>
</template>

<style scoped></style>
