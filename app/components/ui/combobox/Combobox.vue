<script setup lang="ts">
import { ComboboxRoot, useForwardPropsEmits } from 'reka-ui';
import type { ComboboxRootEmits, ComboboxRootProps } from 'reka-ui';

const props = defineProps<ComboboxRootProps>();
const emits = defineEmits<ComboboxRootEmits>();

const forwarded = useForwardPropsEmits(props, emits);
</script>

<template>
	<ComboboxRoot data-slot="combobox" v-bind="forwarded">
		<slot />
	</ComboboxRoot>
</template>
