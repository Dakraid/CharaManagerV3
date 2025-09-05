<script setup lang="ts">
import { ChevronUp } from 'lucide-vue-next';
import { SelectScrollUpButton, useForwardProps } from 'reka-ui';
import type { SelectScrollUpButtonProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<SelectScrollUpButton data-slot="select-scroll-up-button" v-bind="forwardedProps" :class="cn('flex cursor-default items-center justify-center py-1', props.class)">
		<slot>
			<ChevronUp class="size-4" />
		</slot>
	</SelectScrollUpButton>
</template>
