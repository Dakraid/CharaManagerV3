<script setup lang="ts">
import { Minus } from 'lucide-vue-next';
import type { NumberFieldDecrementProps } from 'reka-ui';
import { NumberFieldDecrement, useForwardProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<NumberFieldDecrementProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
	<NumberFieldDecrement
		data-slot="decrement"
		v-bind="forwarded"
		:class="cn('absolute top-1/2 left-0 -translate-y-1/2 p-3 disabled:cursor-not-allowed disabled:opacity-20', props.class)">
		<slot>
			<Minus class="h-4 w-4" />
		</slot>
	</NumberFieldDecrement>
</template>
