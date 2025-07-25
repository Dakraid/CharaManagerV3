<script setup lang="ts">
import { DialogTitle } from 'reka-ui';
import type { DialogTitleProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<DialogTitle data-slot="sheet-title" :class="cn('font-semibold text-foreground', props.class)" v-bind="delegatedProps">
		<slot />
	</DialogTitle>
</template>
