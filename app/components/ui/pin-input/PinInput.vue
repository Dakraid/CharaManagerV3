<script setup lang="ts">
import { PinInputRoot, useForwardPropsEmits } from 'reka-ui';
import type { PinInputRootEmits, PinInputRootProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = withDefaults(defineProps<PinInputRootProps & { class?: HTMLAttributes['class'] }>(), {
	modelValue: () => [],
});
const emits = defineEmits<PinInputRootEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;
	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<PinInputRoot data-slot="pin-input" v-bind="forwarded" :class="cn('flex items-center gap-2 disabled:cursor-not-allowed has-disabled:opacity-50', props.class)">
		<slot />
	</PinInputRoot>
</template>
