<script setup lang="ts">
import { AlertDialogDescription } from 'reka-ui';
import type { AlertDialogDescriptionProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AlertDialogDescription data-slot="alert-dialog-description" v-bind="delegatedProps" :class="cn('text-sm text-muted-foreground', props.class)">
		<slot />
	</AlertDialogDescription>
</template>
