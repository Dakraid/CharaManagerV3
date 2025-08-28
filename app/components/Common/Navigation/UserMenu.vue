<script setup lang="ts">
import { cn } from '~~/lib/utils';

const colorMode = useColorMode();
const settingsStore = useSettingsStore();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="outline" class="z-10 justify-self-end border duration-500 hover:*:rotate-360">
				<Icon name="lucide:cog" size="1.5rem" class="transition-all duration-1000" />
				<span class="sr-only">Show user menu</span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuLabel>
				<div class="flex w-full max-w-sm flex-col gap-1">
					<AuthMenu />
				</div>
			</DropdownMenuLabel>
			<Separator class="mt-1" />
			<DropdownMenuLabel class="flex w-full grow flex-col gap-2">
				<h1 class="text-md text-center font-bold">Theme</h1>
				<Button
					class="flex cursor-pointer justify-between gap-2"
					:variant="colorMode.preference === 'light' ? 'default' : 'outline'"
					@click="colorMode.preference = 'light'">
					<Icon name="lucide:sun" size="1.5rem" />
					<h1>Light</h1>
					<Icon :class="cn(colorMode.preference === 'light' ? 'opacity-100' : 'opacity-0')" name="lucide:check" size="1.5rem" />
				</Button>
				<Button
					class="flex cursor-pointer justify-between gap-2"
					:variant="colorMode.preference === 'dark' ? 'default' : 'outline'"
					@click="colorMode.preference = 'dark'">
					<Icon name="lucide:moon" size="1.5rem" />
					<h1>Dark</h1>
					<Icon :class="cn(colorMode.preference === 'dark' ? 'opacity-100' : 'opacity-0')" name="lucide:check" size="1.5rem" />
				</Button>
				<Button
					class="flex cursor-pointer justify-between gap-2"
					:variant="colorMode.preference === 'system' ? 'default' : 'outline'"
					@click="colorMode.preference = 'system'">
					<Icon name="lucide:sun-moon" size="1.5rem" />
					<h1>System</h1>
					<Icon :class="cn(colorMode.preference === 'system' ? 'opacity-100' : 'opacity-0')" name="lucide:check" size="1.5rem" />
				</Button>
			</DropdownMenuLabel>
			<Separator class="mt-1" />
			<DropdownMenuLabel class="flex w-full grow flex-col gap-2">
				<h1 class="text-md text-center font-bold">Censor</h1>
				<div class="items-top flex w-full max-w-sm gap-2">
					<Checkbox
						id="censorImages"
						:model-value="settingsStore.censorImages"
						class="cursor-pointer"
						@update:model-value="
							(value) => {
								settingsStore.censorImages = value == true;
							}
						" />
					<div class="grid gap-2 leading-none">
						<label
							for="censorImages"
							class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Censor Character Images?
						</label>
					</div>
				</div>
				<div class="items-top flex w-full max-w-sm gap-2">
					<Checkbox
						id="censorNames"
						:model-value="settingsStore.censorNames"
						class="cursor-pointer"
						@update:model-value="
							(value) => {
								settingsStore.censorNames = value == true;
							}
						" />
					<div class="grid gap-2 leading-none">
						<label
							for="censorNames"
							class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Censor Character Names?
						</label>
					</div>
				</div>
			</DropdownMenuLabel>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<style scoped></style>
