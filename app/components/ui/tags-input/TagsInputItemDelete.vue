<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { TagsInputItemDelete, useForwardProps } from 'reka-ui';
import type { TagsInputItemDeleteProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<TagsInputItemDeleteProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<TagsInputItemDelete v-bind="forwardedProps" :class="cn('mr-1 flex rounded bg-transparent', props.class)">
		<slot>
			<X class="h-4 w-4" />
		</slot>
	</TagsInputItemDelete>
</template>
