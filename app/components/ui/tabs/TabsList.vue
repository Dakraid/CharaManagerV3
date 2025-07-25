<script setup lang="ts">
import { TabsList } from 'reka-ui';
import type { TabsListProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<TabsList
		data-slot="tabs-list"
		v-bind="delegatedProps"
		:class="cn('inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground', props.class)">
		<slot />
	</TabsList>
</template>
