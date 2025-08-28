<script lang="ts" setup>
import { RangeCalendarGrid, useForwardProps } from 'reka-ui';
import type { RangeCalendarGridProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<RangeCalendarGridProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarGrid data-slot="range-calendar-grid" :class="cn('w-full border-collapse space-x-1', props.class)" v-bind="forwardedProps">
		<slot />
	</RangeCalendarGrid>
</template>
