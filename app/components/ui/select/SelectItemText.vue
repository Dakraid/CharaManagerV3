<script setup lang="ts">
import { SelectItemText } from 'reka-ui';
import type { SelectItemTextProps } from 'reka-ui';

const props = defineProps<SelectItemTextProps>();
</script>

<template>
	<SelectItemText data-slot="select-item-text" v-bind="props">
		<slot />
	</SelectItemText>
</template>
