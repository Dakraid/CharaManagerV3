<script lang="ts" setup>
import { CalendarHeader, useForwardProps } from 'reka-ui';
import type { CalendarHeaderProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<CalendarHeaderProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<CalendarHeader data-slot="calendar-header" :class="cn('relative flex w-full items-center justify-center pt-1', props.class)" v-bind="forwardedProps">
		<slot />
	</CalendarHeader>
</template>
