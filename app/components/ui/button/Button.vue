<script setup lang="ts">
import { Primitive } from 'reka-ui';
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

import { buttonVariants } from '.';
import type { ButtonVariants } from '.';

interface Props extends PrimitiveProps {
	variant?: ButtonVariants['variant'];
	size?: ButtonVariants['size'];
	class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
	as: 'button',
});
</script>

<template>
	<Primitive data-slot="button" :as="as" :as-child="asChild" :class="cn(buttonVariants({ variant, size }), props.class)">
		<slot />
	</Primitive>
</template>
