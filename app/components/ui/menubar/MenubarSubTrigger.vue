<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { ChevronRight } from 'lucide-vue-next';
import { MenubarSubTrigger, useForwardProps } from 'reka-ui';
import type { MenubarSubTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<MenubarSubTriggerProps & { class?: HTMLAttributes['class']; inset?: boolean }>();

const delegatedProps = reactiveOmit(props, 'class', 'inset');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<MenubarSubTrigger
		data-slot="menubar-sub-trigger"
		:data-inset="inset ? '' : undefined"
		v-bind="forwardedProps"
		:class="
			cn(
				'flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[inset]:pl-8 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
				props.class
			)
		">
		<slot />
		<ChevronRight class="ml-auto size-4" />
	</MenubarSubTrigger>
</template>
