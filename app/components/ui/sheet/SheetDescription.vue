<script setup lang="ts">
import { DialogDescription } from 'reka-ui';
import type { DialogDescriptionProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<DialogDescription data-slot="sheet-description" :class="cn('text-sm text-muted-foreground', props.class)" v-bind="delegatedProps">
		<slot />
	</DialogDescription>
</template>
