<script lang="ts" setup>
import { RangeCalendarHeadCell, useForwardProps } from 'reka-ui';
import type { RangeCalendarHeadCellProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<RangeCalendarHeadCellProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarHeadCell
		data-slot="range-calendar-head-cell"
		:class="cn('w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground', props.class)"
		v-bind="forwardedProps">
		<slot />
	</RangeCalendarHeadCell>
</template>
