<script setup lang="ts">
import { Search } from 'lucide-vue-next';
import { ListboxFilter, useForwardProps } from 'reka-ui';
import type { ListboxFilterProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

import { useCommand } from '.';

defineOptions({
	inheritAttrs: false,
});

const props = defineProps<
	ListboxFilterProps & {
		class?: HTMLAttributes['class'];
	}
>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);

const { filterState } = useCommand();
</script>

<template>
	<div data-slot="command-input-wrapper" class="flex h-12 items-center gap-2 border-b px-3">
		<Search class="size-4 shrink-0 opacity-50" />
		<ListboxFilter
			v-bind="{ ...forwardedProps, ...$attrs }"
			v-model="filterState.search"
			data-slot="command-input"
			auto-focus
			:class="
				cn(
					'flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
					props.class
				)
			" />
	</div>
</template>
