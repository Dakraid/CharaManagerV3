<script setup lang="ts">
import { MenubarRoot, useForwardPropsEmits } from 'reka-ui';
import type { MenubarRootEmits, MenubarRootProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<MenubarRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<MenubarRootEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<MenubarRoot data-slot="menubar" v-bind="forwarded" :class="cn('flex h-9 items-center gap-1 rounded-md border bg-background p-1 shadow-xs', props.class)">
		<slot />
	</MenubarRoot>
</template>
