<script lang="ts" setup>
import type { DialogOverlayProps } from 'reka-ui';
import { DrawerOverlay } from 'vaul-vue';
import { computed } from 'vue';
import type { HtmlHTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<DialogOverlayProps & { class?: HtmlHTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<DrawerOverlay
		data-slot="drawer-overlay"
		v-bind="delegatedProps"
		:class="
			cn(
				'fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
				props.class
			)
		" />
</template>
