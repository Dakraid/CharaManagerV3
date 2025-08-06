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
	definition.value.content.data.alternate_greetings.push('');
}

async function deleteAlternativeMessage(index: number) {
	definition.value.content.data.alternate_greetings.splice(index, 1);
}

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
		<div class="Character-Editor-Selector h-9 w-full rounded-md bg-background">
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

		<div class="Character-Editor-Content h-full w-full overflow-hidden rounded-md bg-background">
			<div v-if="selectedEditor === 'general'" class="flex h-full flex-col flex-nowrap overflow-y-auto p-4">
				<Label for="description" class="mb-2 text-xl">Description</Label>
				<div class="mb-2 flex h-full grow flex-row gap-2">
					<Textarea id="description" v-model="definition.content.data.description" spellcheck="true" class="h-full max-h-96" />
					<Textarea
						v-if="previousContent.description.trim().length > 10"
						id="description_old"
						v-model="previousContent.description"
						spellcheck="true"
						class="h-full max-h-96" />
				</div>

				<Label for="first_message" class="mb-2 text-xl">First Message</Label>
				<div class="mb-2 flex h-full grow flex-row gap-2">
					<Textarea id="first_message" v-model="definition.content.data.first_mes" spellcheck="true" class="h-full max-h-96" />
					<Textarea
						v-if="previousContent.first_mes.trim().length > 10"
						id="first_message_old"
						v-model="previousContent.first_mes"
						contenteditable="false"
						class="h-full max-h-96" />
				</div>

				<Label for="personality" class="mb-2 text-xl">Personality</Label>
				<div class="mb-2 flex h-full grow flex-row gap-2">
					<Textarea id="personality" v-model="definition.content.data.personality" spellcheck="true" class="h-full max-h-96" />
					<Textarea
						v-if="previousContent.personality.trim().length > 10"
						id="personality_old"
						v-model="previousContent.personality"
						contenteditable="false"
						class="h-full max-h-96" />
				</div>

				<Label for="scenario" class="mb-2 text-xl">Scenario</Label>
				<div class="mb-2 flex h-full grow flex-row gap-2">
					<Textarea id="scenario" v-model="definition.content.data.scenario" spellcheck="true" class="h-full max-h-96" />
					<Textarea
						v-if="previousContent.scenario.trim().length > 10"
						id="scenario_old"
						v-model="previousContent.scenario"
						contenteditable="false"
						class="h-full max-h-96" />
				</div>
			</div>

			<div v-else-if="selectedEditor === 'alternatives'" class="flex h-full flex-col flex-nowrap p-4">
				<Label for="alt_greetings" class="my-2 text-xl">Alternative Greetings</Label>
				<Button id="save" type="submit" class="my-2" variant="secondary" @click="addGreeting">
					<span class="sr-only">Add Greeting</span>
					<Icon name="lucide:message-square-plus" size="1.5em" />
				</Button>
				<div class="flex h-full flex-col flex-nowrap overflow-y-auto">
					<div
						v-for="(item, index) in definition.content.data.alternate_greetings"
						:key="item"
						class="mr-2 mb-2 grid max-h-96 grid-cols-[1fr_48px] gap-2">
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

<style scoped></style>
