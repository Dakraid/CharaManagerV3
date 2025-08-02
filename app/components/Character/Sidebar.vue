<script setup lang="ts">
import { cn } from '~~/lib/utils';

const appStore = useAppStore();
</script>

<template>
	<div :class="cn('h-full overflow-hidden pl-4 transition-all duration-300', appStore.showActions ? 'z-10 opacity-100' : '-z-10 opacity-0')">
		<div class="layout grid h-full gap-4 overflow-hidden rounded-xl border bg-background p-2">
			<div class="area-upload flex flex-col gap-2">
				<h1 class="rounded-md border bg-accent p-1 text-center text-xl font-bold">File Upload</h1>
				<CharacterFiles />
			</div>
			<Separator orientation="horizontal" class="area-separator" />
			<div class="area-fetch flex min-h-[238px] flex-col gap-2">
				<h1 class="rounded-md border bg-accent p-1 text-center text-xl font-bold">Fetch from URL</h1>
				<CharacterFetch />
			</div>
		</div>
	</div>
</template>

<style scoped>
.layout {
	grid-template-columns: 1fr;
	grid-template-rows: min-content min-content min-content;
	grid-template-areas:
		'Upload'
		'Separator'
		'Fetch';
}

.area-upload {
	grid-area: Upload;
}

.area-separator {
	grid-area: Separator;
}

.area-fetch {
	grid-area: Fetch;
}
</style>
