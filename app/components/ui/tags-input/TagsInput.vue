<script setup lang="ts">
import { TagsInputRoot, useForwardPropsEmits } from 'reka-ui';
import type { TagsInputRootEmits, TagsInputRootProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<TagsInputRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<TagsInputRootEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<TagsInputRoot
		v-bind="forwarded"
		:class="cn('flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm', props.class)">
		<slot />
	</TagsInputRoot>
</template>
