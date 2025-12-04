<script setup lang="ts">
import { Edit, Plus, Trash2 } from 'lucide-vue-next';

const lorebooks = ref<Lorebook[]>([]);
const router = useRouter();

async function fetchLorebooks() {
	const result = await $fetch<Lorebook[]>('/api/lorebooks');
	if (result) {
		lorebooks.value = result;
	}
}

async function createLorebook() {
	const result = await $fetch<Lorebook>('/api/lorebooks', {
		method: 'POST',
		body: {
			name: 'New Lorebook',
			description: 'A new lorebook',
			entries: [],
		},
	});
	if (result) {
		await router.push(`/lorebooks/${result.id}`);
	}
}

async function deleteLorebook(id: number) {
	if (!confirm('Are you sure you want to delete this lorebook?')) return;

	await $fetch(`/api/lorebooks/${id}`, {
		method: 'DELETE',
	});

	await fetchLorebooks();
}

onMounted(fetchLorebooks);
</script>

<template>
	<div class="Lorebook-Layout h-full w-full px-4">
		<div class="Lorebook-Controls flex items-center justify-around">
			<h1 class="text-3xl font-bold">Lorebooks</h1>
			<Button @click="createLorebook">
				<Plus class="mr-2 h-4 w-4" />
				Create Lorebook
			</Button>
		</div>

		<div class="Lorebook-Content flex h-full w-full flex-wrap gap-4 overflow-x-hidden overflow-y-scroll rounded-md px-4 py-6">
			<Card v-for="book in lorebooks" :key="book.id" class="h-sm max-h-sm w-sm transition-all hover:bg-muted/50">
				<CardHeader>
					<CardTitle>{{ book.name || 'Untitled' }}</CardTitle>
					<CardDescription class="truncate">{{ book.description || 'No description' }}</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="text-sm text-muted-foreground">{{ book.entries.length }} entries</div>
				</CardContent>
				<CardFooter class="flex justify-end gap-2">
					<Button variant="outline" size="icon" @click="router.push(`/lorebooks/${book.id}`)">
						<Edit class="h-4 w-4" />
					</Button>
					<Button variant="destructive" size="icon" @click="deleteLorebook(book.id)">
						<Trash2 class="h-4 w-4" />
					</Button>
				</CardFooter>
			</Card>
		</div>

		<div v-if="lorebooks.length === 0" class="mt-12 text-center text-muted-foreground">No lorebooks found. Create one to get started.</div>
	</div>
</template>
