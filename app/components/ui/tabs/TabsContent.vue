<script setup lang="ts">
import { TabsContent } from 'reka-ui';
import type { TabsContentProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<TabsContentProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<TabsContent data-slot="tabs-content" :class="cn('flex-1 outline-none', props.class)" v-bind="delegatedProps">
		<slot />
	</TabsContent>
</template>
