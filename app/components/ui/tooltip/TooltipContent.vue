<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { TooltipArrow, TooltipContent, TooltipPortal, useForwardPropsEmits } from 'reka-ui';
import type { TooltipContentEmits, TooltipContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

defineOptions({
	inheritAttrs: false,
});

const props = withDefaults(defineProps<TooltipContentProps & { class?: HTMLAttributes['class'] }>(), {
	sideOffset: 4,
});

const emits = defineEmits<TooltipContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<TooltipPortal>
		<TooltipContent
			data-slot="tooltip-content"
			v-bind="{ ...forwarded, ...$attrs }"
			:class="
				cn(
					'z-50 w-fit animate-in rounded-md bg-primary px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
					props.class
				)
			">
			<slot />

			<TooltipArrow class="z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary" />
		</TooltipContent>
	</TooltipPortal>
</template>
