<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { SelectScrollDownButton, useForwardProps } from 'reka-ui';
import type { SelectScrollDownButtonProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<SelectScrollDownButtonProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<SelectScrollDownButton
		data-slot="select-scroll-down-button"
		v-bind="forwardedProps"
		:class="cn('flex cursor-default items-center justify-center py-1', props.class)">
		<slot>
			<ChevronDown class="size-4" />
		</slot>
	</SelectScrollDownButton>
</template>
