<script setup lang="ts">
import { DialogTrigger } from 'reka-ui';
import type { DialogTriggerProps } from 'reka-ui';

const props = defineProps<DialogTriggerProps>();
</script>

<template>
	<DialogTrigger data-slot="sheet-trigger" v-bind="props">
		<slot />
	</DialogTrigger>
</template>
