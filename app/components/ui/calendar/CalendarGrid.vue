<script lang="ts" setup>
import { CalendarGrid, useForwardProps } from 'reka-ui';
import type { CalendarGridProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<CalendarGridProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarGrid data-slot="calendar-grid" :class="cn('w-full border-collapse space-x-1', props.class)" v-bind="forwardedProps">
		<slot />
	</CalendarGrid>
</template>
