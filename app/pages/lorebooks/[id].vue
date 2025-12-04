<script setup lang="ts">
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const lorebook = ref<Lorebook | null>(null);
const loading = ref(true);

// Entry editing state
const editingEntryIndex = ref<number | null>(null);
const editingEntry = ref<Entry | null>(null);
const isEntrySheetOpen = ref(false);

async function fetchLorebook() {
	loading.value = true;
	try {
		const result = await $fetch<Lorebook>(`/api/lorebooks/${id}`);
		if (result) {
			lorebook.value = result;
		}
	} catch (e) {
		toast.error('Failed to load lorebook');
	} finally {
		loading.value = false;
	}
}

async function saveLorebook() {
	if (!lorebook.value) return;

	try {
		await $fetch(`/api/lorebooks/${id}`, {
			method: 'PUT',
			body: lorebook.value,
		});
		toast.success('Lorebook saved');
	} catch (e) {
		toast.error('Failed to save lorebook');
	}
}

function addEntry() {
	editingEntry.value = {
		keys: [],
		content: '',
		extensions: {},
		enabled: true,
		insertion_order: 0,
		name: 'New Entry',
		priority: 10,
	};
	editingEntryIndex.value = -1; // New entry
	isEntrySheetOpen.value = true;
}

function editEntry(index: number) {
	if (!lorebook.value) return;
	editingEntry.value = JSON.parse(JSON.stringify(lorebook.value.entries[index])); // Deep copy
	editingEntryIndex.value = index;
	isEntrySheetOpen.value = true;
}

function saveEntry() {
	if (!lorebook.value || !editingEntry.value || editingEntryIndex.value === null) return;

	if (editingEntryIndex.value === -1) {
		lorebook.value.entries.push(editingEntry.value);
	} else {
		lorebook.value.entries[editingEntryIndex.value] = editingEntry.value;
	}

	isEntrySheetOpen.value = false;
	editingEntry.value = null;
	editingEntryIndex.value = null;
}

function deleteEntry(index: number) {
	if (!lorebook.value) return;
	if (!confirm('Delete this entry?')) return;
	lorebook.value.entries.splice(index, 1);
}

onMounted(() => {
	try {
		fetchLorebook();
	} catch (err: any) {
		console.error(err);
	}
});
</script>

<template>
	<div v-if="lorebook" class="container mx-auto flex h-[calc(100vh-4rem)] flex-col py-8">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" @click="router.push('/lorebooks')">
					<ArrowLeft class="h-4 w-4" />
				</Button>
				<h1 class="text-2xl font-bold">{{ lorebook.name || 'Untitled Lorebook' }}</h1>
			</div>
			<Button @click="saveLorebook">
				<Save class="mr-2 h-4 w-4" />
				Save Changes
			</Button>
		</div>

		<div class="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
			<!-- Settings Column -->
			<Card class="h-fit overflow-auto">
				<CardHeader>
					<CardTitle>Settings</CardTitle>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="space-y-2">
						<Label>Name</Label>
						<Input v-model="lorebook.name" placeholder="Lorebook Name" />
					</div>

					<div class="space-y-2">
						<Label>Description</Label>
						<Textarea v-model="lorebook.description" placeholder="Description" />
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Scan Depth</Label>
							<Input v-model.number="lorebook.scan_depth" type="number" />
						</div>

						<div class="space-y-2">
							<Label>Token Budget</Label>
							<Input v-model.number="lorebook.token_budget" type="number" />
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Label>Recursive Scanning</Label>
						<Switch v-model="lorebook.recursive_scanning" />
					</div>
				</CardContent>
			</Card>

			<!-- Entries Column -->
			<Card class="flex flex-col overflow-hidden lg:col-span-2">
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>Entries ({{ lorebook.entries.length }})</CardTitle>
					<Button size="sm" @click="addEntry">
						<Plus class="mr-2 h-4 w-4" />
						Add Entry
					</Button>
				</CardHeader>
				<CardContent class="flex-1 overflow-auto p-0">
					<div v-if="lorebook.entries.length === 0" class="p-8 text-center text-muted-foreground">No entries yet.</div>
					<div v-else class="divide-y">
						<div v-for="(entry, index) in lorebook.entries" :key="index" class="group flex cursor-pointer items-center justify-between p-4 hover:bg-muted/50" @click="editEntry(index)">
							<div class="min-w-0 flex-1">
								<div class="mb-1 flex items-center gap-2">
									<span class="truncate font-medium">{{ entry.name || 'Untitled Entry' }}</span>
									<Badge v-if="!entry.enabled" variant="outline">Disabled</Badge>
								</div>
								<div class="truncate text-xs text-muted-foreground">Keys: {{ entry.keys.join(', ') }}</div>
								<div class="mt-1 truncate text-xs text-muted-foreground">
									{{ entry.content }}
								</div>
							</div>
							<Button variant="ghost" size="icon" class="opacity-0 transition-opacity group-hover:opacity-100" @click.stop="deleteEntry(index)">
								<Trash2 class="h-4 w-4 text-destructive" />
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>

		<!-- Entry Editor Sheet -->
		<Sheet v-model:open="isEntrySheetOpen">
			<SheetContent class="w-[400px] overflow-y-auto sm:w-[540px]">
				<SheetHeader>
					<SheetTitle>{{ editingEntryIndex === -1 ? 'New Entry' : 'Edit Entry' }}</SheetTitle>
				</SheetHeader>

				<div v-if="editingEntry" class="space-y-6 py-6">
					<div class="space-y-2">
						<Label>Name (Optional)</Label>
						<Input v-model="editingEntry.name" placeholder="Entry Name" />
					</div>

					<div class="flex items-center justify-between">
						<Label>Enabled</Label>
						<Switch v-model="editingEntry.enabled" />
					</div>

					<div class="space-y-2">
						<Label>Trigger Keys (comma separated)</Label>
						<Input
							:model-value="editingEntry.keys.join(', ')"
							placeholder="key1, key2, key3"
							@update:model-value="
								(val) =>
									(editingEntry!.keys = (val as string)
										.split(',')
										.map((k) => k.trim())
										.filter((k) => k))
							" />
					</div>

					<div class="space-y-2">
						<Label>Content</Label>
						<Textarea v-model="editingEntry.content" placeholder="Lore content..." class="min-h-[200px]" />
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label>Priority</Label>
							<Input v-model.number="editingEntry.priority" type="number" />
						</div>

						<div class="space-y-2">
							<Label>Insertion Order</Label>
							<Input v-model.number="editingEntry.insertion_order" type="number" />
						</div>
					</div>

					<div class="flex items-center justify-between">
						<Label>Case Sensitive</Label>
						<Switch v-model="editingEntry.case_sensitive" />
					</div>

					<div class="flex items-center justify-between">
						<Label>Selective</Label>
						<Switch v-model="editingEntry.selective" />
					</div>
				</div>

				<SheetFooter>
					<Button @click="saveEntry">Save Entry</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	</div>
</template>
