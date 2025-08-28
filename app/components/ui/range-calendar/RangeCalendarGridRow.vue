<script lang="ts" setup>
import { RangeCalendarGridRow, useForwardProps } from 'reka-ui';
import type { RangeCalendarGridRowProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<RangeCalendarGridRowProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarGridRow data-slot="range-calendar-grid-row" :class="cn('flex', props.class)" v-bind="forwardedProps">
		<slot />
	</RangeCalendarGridRow>
</template>
