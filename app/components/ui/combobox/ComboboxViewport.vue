<script setup lang="ts">
import type { ComboboxViewportProps } from 'reka-ui';
import { ComboboxViewport, useForwardProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<ComboboxViewportProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
	<ComboboxViewport data-slot="combobox-viewport" v-bind="forwarded" :class="cn('max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto', props.class)">
		<slot />
	</ComboboxViewport>
</template>
