<script setup lang="ts">
import { cn } from '~~/lib/utils';

const appStore = useAppStore();
</script>

<template>
	<div :class="cn('overflow-hidden pl-4 transition-all duration-300', appStore.showActions ? 'z-10 opacity-100' : '-z-10 opacity-0')">
		<div class="h-full rounded-xl border bg-background p-2">
			<Tabs default-value="upload" class="min-w-[400px]">
				<TabsList class="w-full">
					<TabsTrigger value="upload"> Upload </TabsTrigger>
					<TabsTrigger value="password"> Password </TabsTrigger>
				</TabsList>
				<TabsContent value="upload" class="flex flex-col gap-4 p-2">
					<div>
						<h1 class="text-xl">File Upload</h1>
						<CharacterFiles />
					</div>
					<div>
						<h1 class="text-xl">Fetch from URL</h1>
						<CharacterFetch />
					</div>
				</TabsContent>
				<TabsContent value="password"> Change your password here. </TabsContent>
			</Tabs>
		</div>
	</div>
</template>

<style scoped></style>
