<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';
import { ContextMenuSubTrigger, useForwardProps } from 'reka-ui';
import type { ContextMenuSubTriggerProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<ContextMenuSubTriggerProps & { class?: HTMLAttributes['class']; inset?: boolean }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<ContextMenuSubTrigger
		data-slot="context-menu-sub-trigger"
		:data-inset="inset ? '' : undefined"
		v-bind="forwardedProps"
		:class="
			cn(
				`flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
				props.class
			)
		">
		<slot />
		<ChevronRight class="ml-auto" />
	</ContextMenuSubTrigger>
</template>
