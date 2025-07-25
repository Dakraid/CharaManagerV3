<script setup lang="ts">
import { ContextMenuTrigger, useForwardProps } from 'reka-ui';
import type { ContextMenuTriggerProps } from 'reka-ui';

const props = defineProps<ContextMenuTriggerProps>();

const forwardedProps = useForwardProps(props);
</script>

<template>
	<ContextMenuTrigger data-slot="context-menu-trigger" v-bind="forwardedProps">
		<slot />
	</ContextMenuTrigger>
</template>
