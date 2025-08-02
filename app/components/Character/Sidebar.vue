<script setup lang="ts">
import { cn } from '~~/lib/utils';

const appStore = useAppStore();
</script>

<template>
	<div :class="cn('h-full overflow-hidden pl-4 transition-all duration-300', appStore.showActions ? 'z-10 opacity-100' : '-z-10 opacity-0')">
		<div class="flex h-full flex-col rounded-xl border bg-background p-2">
			<Tabs default-value="upload" class="flex h-full flex-col">
				<TabsList class="w-full flex-shrink-0">
					<TabsTrigger value="upload"> Upload </TabsTrigger>
					<TabsTrigger value="password"> Password </TabsTrigger>
				</TabsList>
				<TabsContent value="upload" class="flex min-h-0 flex-1 flex-col gap-4 p-2">
					<div class="flex-shrink-0">
						<h1 class="text-xl">File Upload</h1>
						<CharacterFiles />
					</div>
					<div class="flex min-h-0 flex-1 flex-col">
						<h1 class="flex-shrink-0 text-xl">Fetch from URL</h1>
						<CharacterFetch class="min-h-0 flex-1" />
					</div>
				</TabsContent>
				<TabsContent value="password"> Change your password here. </TabsContent>
			</Tabs>
		</div>
	</div>
</template>

<style scoped></style>
