<script lang="ts" setup>
import { Primitive } from 'reka-ui';
import type { PrimitiveProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = withDefaults(defineProps<PrimitiveProps & { class?: HTMLAttributes['class'] }>(), {
	as: 'a',
});
</script>

<template>
	<Primitive data-slot="breadcrumb-link" :as="as" :as-child="asChild" :class="cn('transition-colors hover:text-foreground', props.class)">
		<slot />
	</Primitive>
</template>
