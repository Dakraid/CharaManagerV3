<script lang="ts" setup>
import type { StepperTriggerProps } from 'reka-ui';
import { StepperTrigger, useForwardProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<StepperTriggerProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
	<StepperTrigger v-bind="forwarded" :class="cn('flex flex-col items-center gap-1 rounded-md p-1 text-center', props.class)">
		<slot />
	</StepperTrigger>
</template>
