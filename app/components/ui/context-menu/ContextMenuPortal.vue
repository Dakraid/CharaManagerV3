<script setup lang="ts">
import { ContextMenuPortal } from 'reka-ui';
import type { ContextMenuPortalProps } from 'reka-ui';

const props = defineProps<ContextMenuPortalProps>();
</script>

<template>
	<ContextMenuPortal data-slot="context-menu-portal" v-bind="props">
		<slot />
	</ContextMenuPortal>
</template>
