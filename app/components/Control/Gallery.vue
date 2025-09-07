<script setup lang="ts">
const settingsStore = useSettingsStore();
</script>

<template>
	<div class="flex w-full grow flex-col gap-2">
		<h1 class="text-md text-center font-bold">Gallery Settings</h1>
		<NumberField id="perPage" :default-value="30" :model-value="settingsStore.perPage" :min="1" class="rounded-md border" @update:model-value="settingsStore.perPage = $event">
			<Label for="perPage" class="mx-auto my-auto text-xs">Items per Page</Label>
			<NumberFieldContent>
				<NumberFieldDecrement class="rounded-bl-sm p-2.5 transition-colors hover:bg-muted" />
				<NumberFieldInput class="rounded-none rounded-b-md border-t border-r-0 border-b-0 border-l-0" />
				<NumberFieldIncrement class="rounded-br-sm p-2.5 transition-colors hover:bg-muted" />
			</NumberFieldContent>
		</NumberField>
		<div class="items-top flex h-9 w-full max-w-sm items-center gap-2 rounded-md border p-3">
			<Checkbox
				id="permaControls"
				:model-value="settingsStore.permaControls"
				class="cursor-pointer"
				@update:model-value="
					(value) => {
						settingsStore.permaControls = value == true;
					}
				" />
			<div class="grid gap-2 leading-none">
				<label for="permaControls" class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Permanent Controls? </label>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
