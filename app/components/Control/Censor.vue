<script setup lang="ts">
const settingsStore = useSettingsStore();
</script>

<template>
	<div class="flex w-full grow flex-col gap-2">
		<h1 class="text-md text-center font-bold">Censor</h1>
		<div class="items-top flex h-9 w-full max-w-sm items-center gap-2 rounded-md border p-3">
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
				<label for="censorImages" class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Censor Images? </label>
			</div>
		</div>
		<div class="items-top flex h-9 w-full max-w-sm items-center gap-2 rounded-md border p-3">
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
				<label for="censorNames" class="cursor-pointer text-center text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"> Censor Names? </label>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
