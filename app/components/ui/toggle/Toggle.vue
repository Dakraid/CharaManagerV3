<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { Toggle, useForwardPropsEmits } from 'reka-ui';
import type { ToggleEmits, ToggleProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

import { toggleVariants } from '.';
import type { ToggleVariants } from '.';

const props = withDefaults(
	defineProps<
		ToggleProps & {
			class?: HTMLAttributes['class'];
			variant?: ToggleVariants['variant'];
			size?: ToggleVariants['size'];
		}
	>(),
	{
		variant: 'default',
		size: 'default',
		disabled: false,
	}
);

const emits = defineEmits<ToggleEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'size', 'variant');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<Toggle data-slot="toggle" v-bind="forwarded" :class="cn(toggleVariants({ variant, size }), props.class)">
		<slot />
	</Toggle>
</template>
