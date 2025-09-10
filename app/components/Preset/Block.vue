<script setup lang="ts">
const props = defineProps<{ prompt: Prompt }>();

const roleLabel = computed(() => props.prompt.role ?? (props.prompt.system_prompt ? 'system' : 'assistant'));
const roleBadgeClasses = computed(() => {
	switch (roleLabel.value) {
		case 'system':
			return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
		case 'user':
			return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
		case 'assistant':
		default:
			return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
	}
});

const enabledBadge = computed(() => (props.prompt.enabled === false ? 'Disabled' : 'Enabled'));

const getInjectionPositionName = (position: number) => {
	switch (position) {
		case 0:
			return 'Relative';
		case 1:
			return 'In-Chat';
		default:
			return 'Unknown';
	}
};
</script>

<template>
	<Card class="w-full gap-2 py-4">
		<CardHeader>
			<div class="flex items-start gap-2">
				<div class="min-w-0 flex-1">
					<div class="flex items-center gap-2">
						<Badge class="border" :class="prompt.enabled === false ? 'border-gray-500/20 bg-gray-500/10 text-gray-600' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'">
							{{ enabledBadge }}
						</Badge>
						<Badge :class="['border', roleBadgeClasses]">{{ roleLabel.toUpperCase() }}</Badge>
						<CardTitle class="w-full truncate text-center text-lg">{{ prompt.name || 'Untitled Prompt' }}</CardTitle>
					</div>
				</div>

				<div class="hidden flex-wrap items-center gap-2 text-xs text-muted-foreground sm:flex">
					<span v-if="prompt.injection_position !== undefined" class="rounded-md border border-border bg-muted/60 px-2 py-0.5"
						>Pos: {{ getInjectionPositionName(prompt.injection_position) }}</span
					>
					<span v-if="prompt.injection_depth !== undefined" class="rounded-md border border-border bg-muted/60 px-2 py-0.5">Depth: {{ prompt.injection_depth }}</span>
					<span v-if="prompt.injection_order !== undefined" class="rounded-md border border-border bg-muted/60 px-2 py-0.5">Order: {{ prompt.injection_order }}</span>
				</div>
			</div>
		</CardHeader>

		<Separator />

		<CardContent>
			<label class="text-xs font-medium text-muted-foreground">Content</label>
			<div v-if="prompt.content?.length || prompt.diffParts" class="relative">
				<!-- prettier-ignore -->
				<pre v-if="prompt.diffParts" class="h-60 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-sm leading-relaxed whitespace-pre"><template v-for="(p, i) in prompt.diffParts" :key="i"><span :style="{ color: p.color }">{{ p.value }}</span></template></pre>
				<!-- prettier-ignore -->
				<pre v-else class="h-60 overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-sm leading-relaxed whitespace-pre">{{ prompt.content }}</pre>
			</div>
			<p v-else-if="prompt.marker" class="text-sm text-muted-foreground italic">The content of this prompt is provided by SillyTavern and is not editable.</p>
			<p v-else class="text-sm text-muted-foreground italic">No content provided.</p>
		</CardContent>
	</Card>
</template>

<style scoped></style>
