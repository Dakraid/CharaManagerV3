<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import { AlertDialogAction } from 'reka-ui';
import type { AlertDialogActionProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AlertDialogActionProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AlertDialogAction v-bind="delegatedProps" :class="cn(buttonVariants(), props.class)">
		<slot />
	</AlertDialogAction>
</template>
