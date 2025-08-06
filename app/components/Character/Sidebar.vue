<script setup lang="ts">
import { cn } from '~~/lib/utils';

const appStore = useAppStore();
</script>

<template>
	<div :class="cn('h-full overflow-hidden transition-all duration-300', appStore.showActions ? '' : 'Sidebar-Disable')">
		<div class="Sidebar-Layout grid h-full gap-4 overflow-hidden rounded-xl border bg-background p-2">
			<div class="Sidebar-Upload flex flex-col gap-2">
				<h1 class="rounded-md border bg-accent p-1 text-center text-xl font-bold">File Upload</h1>
				<CharacterFiles />
			</div>
			<Separator orientation="horizontal" class="Sidebar-Separator" />
			<div class="Sidebar-Fetch flex min-h-[238px] flex-col gap-2">
				<h1 class="rounded-md border bg-accent p-1 text-center text-xl font-bold">Fetch from URL</h1>
				<CharacterFetch />
			</div>
		</div>
	</div>
</template>

<style scoped>
.Sidebar-Layout {
	grid-template-columns: 1fr;
	grid-template-rows: min-content min-content min-content;
	grid-template-areas:
		'Upload'
		'Separator'
		'Fetch';
}

.Sidebar-Disable {
	opacity: 0;
	z-index: -10;

	@media (width >= 48rem) {
		opacity: 100;
		z-index: 20;
	}
}

.Sidebar-Upload {
	grid-area: Upload;
}

.Sidebar-Separator {
	grid-area: Separator;
}

.Sidebar-Fetch {
	grid-area: Fetch;
}
</style>
