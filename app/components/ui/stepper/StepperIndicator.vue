<script lang="ts" setup>
import type { StepperIndicatorProps } from 'reka-ui';
import { StepperIndicator, useForwardProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<StepperIndicatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
	<StepperIndicator
		v-bind="forwarded"
		:class="
			cn(
				'inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground/50',
				// Disabled
				'group-data-[disabled]:text-muted-foreground group-data-[disabled]:opacity-50',
				// Active
				'group-data-[state=active]:bg-primary group-data-[state=active]:text-primary-foreground',
				// Completed
				'group-data-[state=completed]:bg-accent group-data-[state=completed]:text-accent-foreground',
				props.class
			)
		">
		<slot />
	</StepperIndicator>
</template>
