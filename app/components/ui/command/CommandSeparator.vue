<script setup lang="ts">
import type { SeparatorProps } from 'reka-ui';
import { Separator } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<SeparatorProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<Separator data-slot="command-separator" v-bind="delegatedProps" :class="cn('-mx-1 h-px bg-border', props.class)">
		<slot />
	</Separator>
</template>
