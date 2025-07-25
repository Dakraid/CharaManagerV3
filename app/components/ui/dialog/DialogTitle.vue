<script setup lang="ts">
import { DialogTitle, useForwardProps } from 'reka-ui';
import type { DialogTitleProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<DialogTitle data-slot="dialog-title" v-bind="forwardedProps" :class="cn('text-lg leading-none font-semibold', props.class)">
		<slot />
	</DialogTitle>
</template>
