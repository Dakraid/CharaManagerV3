<script lang="ts" setup>
import { buttonVariants } from '@/components/ui/button';
import { ChevronRight } from 'lucide-vue-next';
import { RangeCalendarNext, useForwardProps } from 'reka-ui';
import type { RangeCalendarNextProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<RangeCalendarNextProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<RangeCalendarNext
		data-slot="range-calendar-next-button"
		:class="cn(buttonVariants({ variant: 'outline' }), 'absolute right-1', 'size-7 bg-transparent p-0 opacity-50 hover:opacity-100', props.class)"
		v-bind="forwardedProps">
		<slot>
			<ChevronRight class="size-4" />
		</slot>
	</RangeCalendarNext>
</template>
