<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next';
import { PaginationEllipsis } from 'reka-ui';
import type { PaginationEllipsisProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<PaginationEllipsisProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<PaginationEllipsis data-slot="pagination-ellipsis" v-bind="delegatedProps" :class="cn('flex size-9 items-center justify-center', props.class)">
		<slot>
			<MoreHorizontal class="size-4" />
			<span class="sr-only">More pages</span>
		</slot>
	</PaginationEllipsis>
</template>
