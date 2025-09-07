<script setup lang="ts">
const colorMode = useColorMode();

const themes = [
	{ value: 'light', label: 'Light', icon: 'lucide:sun' },
	{ value: 'dark', label: 'Dark', icon: 'lucide:moon' },
	{ value: 'system', label: 'System', icon: 'lucide:sun-moon' },
];

const themeValue = ref<(typeof themes)[0]>();
themeValue.value = themes.find((theme) => theme.value === colorMode.preference);

const setTheme = (theme: any) => {
	colorMode.preference = theme.value;
	themeValue.value = theme;
};
</script>

<template>
	<div class="flex w-full grow flex-col gap-2">
		<h1 class="text-md text-center font-bold">Theme Settings</h1>
		<Combobox v-model="themeValue" by="label" @update:model-value="setTheme">
			<ComboboxAnchor as-child>
				<ComboboxTrigger as-child>
					<Button variant="outline" class="Item-Layout w-full gap-2 p-0 px-2">
						<Icon v-if="themeValue" :name="themeValue.icon" size="1.5rem" class="Item-Icon mr-auto" />

						<h1 class="Item-Label w-full text-center">
							{{ themeValue?.label ?? 'Select Theme' }}
						</h1>

						<Icon name="lucide:chevrons-up-down" size="1rem" class="Item-Indicator ml-auto" />
					</Button>
				</ComboboxTrigger>
			</ComboboxAnchor>

			<ComboboxList>
				<ComboboxGroup>
					<ComboboxItem v-for="theme in themes" :key="theme.value" :value="theme" class="Item-Layout transition-colors hover:bg-accent-foreground/10">
						<Icon :name="theme.icon" size="1.5rem" class="Item-Icon mr-auto" />

						<h1 class="Item-Label w-full text-center">
							{{ theme.label }}
						</h1>

						<ComboboxItemIndicator class="h-full">
							<Icon name="lucide:check" size="1.25rem" class="Item-Indicator h-full" />
						</ComboboxItemIndicator>
					</ComboboxItem>
				</ComboboxGroup>
			</ComboboxList>
		</Combobox>
	</div>
</template>

<style scoped>
.Item-Layout {
	display: grid;
	grid-template-columns: 32px 1fr 32px;
	grid-template-rows: 1fr;
	grid-template-areas: 'Icon Label Indicator';
}

.Item-Icon {
	grid-area: Icon;
}

.Item-Label {
	grid-area: Label;
}

.Item-Indicator {
	grid-area: Indicator;
}
</style>
