<script setup lang="ts">
import type { ListboxGroupProps } from 'reka-ui';
import { ListboxGroup, ListboxGroupLabel, useId } from 'reka-ui';
import { computed, onMounted, onUnmounted } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

import { provideCommandGroupContext, useCommand } from '.';

const props = defineProps<
	ListboxGroupProps & {
		class?: HTMLAttributes['class'];
		heading?: string;
	}
>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const { allGroups, filterState } = useCommand();
const id = useId();

const isRender = computed(() => (!filterState.search ? true : filterState.filtered.groups.has(id)));

provideCommandGroupContext({ id });
onMounted(() => {
	if (!allGroups.value.has(id)) allGroups.value.set(id, new Set());
});
onUnmounted(() => {
	allGroups.value.delete(id);
});
</script>

<template>
	<ListboxGroup
		v-bind="delegatedProps"
		:id="id"
		data-slot="command-group"
		:class="cn('overflow-hidden p-1 text-foreground', props.class)"
		:hidden="isRender ? undefined : true">
		<ListboxGroupLabel v-if="heading" class="px-2 py-1.5 text-xs font-medium text-muted-foreground">
			{{ heading }}
		</ListboxGroupLabel>
		<slot />
	</ListboxGroup>
</template>
