<script lang="ts" setup>
import { buttonVariants } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-vue-next';
import { RangeCalendarPrev, useForwardProps } from 'reka-ui';
import type { RangeCalendarPrevProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<RangeCalendarPrevProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarPrev
		data-slot="range-calendar-prev-button"
		:class="cn(buttonVariants({ variant: 'outline' }), 'absolute left-1', 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', props.class)"
		v-bind="forwardedProps">
		<slot>
			<ChevronLeft class="size-4" />
		</slot>
	</RangeCalendarPrev>
</template>
