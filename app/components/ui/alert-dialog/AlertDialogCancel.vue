<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { AlertDialogCancel } from 'reka-ui';
import type { AlertDialogCancelProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AlertDialogCancelProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AlertDialogCancel v-bind="delegatedProps" :class="cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', props.class)">
		<slot />
	</AlertDialogCancel>
</template>
