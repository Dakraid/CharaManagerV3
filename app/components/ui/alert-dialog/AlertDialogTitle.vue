<script setup lang="ts">
import { AlertDialogTitle } from 'reka-ui';
import type { AlertDialogTitleProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AlertDialogTitleProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AlertDialogTitle data-slot="alert-dialog-title" v-bind="delegatedProps" :class="cn('text-lg font-semibold', props.class)">
		<slot />
	</AlertDialogTitle>
</template>
