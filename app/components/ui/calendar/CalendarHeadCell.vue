<script lang="ts" setup>
import { CalendarHeadCell, useForwardProps } from 'reka-ui';
import type { CalendarHeadCellProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<CalendarHeadCellProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarHeadCell
		data-slot="calendar-head-cell"
		:class="cn('w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground', props.class)"
		v-bind="forwardedProps">
		<slot />
	</CalendarHeadCell>
</template>
