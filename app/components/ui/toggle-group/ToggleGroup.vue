<script setup lang="ts">
import type { toggleVariants } from '@/components/ui/toggle';
import { reactiveOmit } from '@vueuse/core';
import type { VariantProps } from 'class-variance-authority';
import { ToggleGroupRoot, useForwardPropsEmits } from 'reka-ui';
import type { ToggleGroupRootEmits, ToggleGroupRootProps } from 'reka-ui';
import { provide } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

type ToggleGroupVariants = VariantProps<typeof toggleVariants>;

const props = defineProps<
	ToggleGroupRootProps & {
		class?: HTMLAttributes['class'];
		variant?: ToggleGroupVariants['variant'];
		size?: ToggleGroupVariants['size'];
	}
>();
const emits = defineEmits<ToggleGroupRootEmits>();

provide('toggleGroup', {
	variant: props.variant,
	size: props.size,
});

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<ToggleGroupRoot
		data-slot="toggle-group"
		:data-size="size"
		:data-variant="variant"
		v-bind="forwarded"
		:class="cn('group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs', props.class)">
		<slot />
	</ToggleGroupRoot>
</template>
