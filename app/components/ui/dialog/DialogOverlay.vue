<script setup lang="ts">
import { DialogOverlay } from 'reka-ui';
import type { DialogOverlayProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<DialogOverlay
		data-slot="dialog-overlay"
		v-bind="delegatedProps"
		:class="
			cn(
				'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
				props.class
			)
		">
		<slot />
	</DialogOverlay>
</template>
