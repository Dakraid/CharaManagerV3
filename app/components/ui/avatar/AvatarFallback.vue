<script setup lang="ts">
import { AvatarFallback } from 'reka-ui';
import type { AvatarFallbackProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<AvatarFallbackProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});
</script>

<template>
	<AvatarFallback
		data-slot="avatar-fallback"
		v-bind="delegatedProps"
		:class="cn('flex size-full items-center justify-center rounded-full bg-muted', props.class)">
		<slot />
	</AvatarFallback>
</template>
