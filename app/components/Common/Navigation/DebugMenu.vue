<script setup lang="ts">
const appStore = useAppStore();
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="outline" class="z-10 justify-self-end border duration-500 hover:*:rotate-360">
				<Icon name="lucide:bug" size="1.5rem" class="transition-all duration-1000" />
				<span class="sr-only">Show debug menu</span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuLabel class="flex w-full grow flex-col gap-2">
				<h1 class="text-md text-center font-bold">States</h1>
				<div class="items-top flex w-full max-w-sm gap-2">
					<Checkbox
						id="censorImages"
						:model-value="appStore.isFetching"
						class="cursor-pointer"
						@update:model-value="
							(value) => {
								appStore.isFetching = value as boolean;
							}
						" />
					<div class="grid gap-2 leading-none">
						<label for="censorImages" class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							appStore.isFetching
						</label>
					</div>
				</div>
			</DropdownMenuLabel>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<style scoped></style>
