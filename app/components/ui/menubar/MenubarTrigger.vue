<script setup lang="ts">
import { MenubarTrigger, useForwardProps } from 'reka-ui';
import type { MenubarTriggerProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<MenubarTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<MenubarTrigger
		data-slot="menubar-trigger"
		v-bind="forwardedProps"
		:class="
			cn(
				'flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
				props.class
			)
		">
		<slot />
	</MenubarTrigger>
</template>
