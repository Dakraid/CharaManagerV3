<script setup lang="ts">
import { toggleVariants } from '@/components/ui/toggle';
import { reactiveOmit } from '@vueuse/core';
import type { VariantProps } from 'class-variance-authority';
import { ToggleGroupItem, useForwardProps } from 'reka-ui';
import type { ToggleGroupItemProps } from 'reka-ui';
import { inject } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

type ToggleGroupVariants = VariantProps<typeof toggleVariants>;

const props = defineProps<
	ToggleGroupItemProps & {
		class?: HTMLAttributes['class'];
		variant?: ToggleGroupVariants['variant'];
		size?: ToggleGroupVariants['size'];
	}
>();

const context = inject<ToggleGroupVariants>('toggleGroup');

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<ToggleGroupItem
		data-slot="toggle-group-item"
		:data-variant="context?.variant || variant"
		:data-size="context?.size || size"
		v-bind="forwardedProps"
		:class="
			cn(
				toggleVariants({
					variant: context?.variant || variant,
					size: context?.size || size,
				}),
				'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
				props.class
			)
		">
		<slot />
	</ToggleGroupItem>
</template>
