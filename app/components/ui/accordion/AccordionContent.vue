<script setup lang="ts">
import { AccordionContent } from 'reka-ui';
import type { AccordionContentProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AccordionContentProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AccordionContent
		data-slot="accordion-content"
		v-bind="delegatedProps"
		class="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
		<div :class="cn('pt-0 pb-4', props.class)">
			<slot />
		</div>
	</AccordionContent>
</template>
