<script setup lang="ts">
import { SelectSeparator } from 'reka-ui';
import type { SelectSeparatorProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<SelectSeparator data-slot="select-separator" v-bind="delegatedProps" :class="cn('pointer-events-none -mx-1 my-1 h-px bg-border', props.class)" />
</template>
