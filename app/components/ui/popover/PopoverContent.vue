<script setup lang="ts">
import { PopoverContent, PopoverPortal, useForwardPropsEmits } from 'reka-ui';
import type { PopoverContentEmits, PopoverContentProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

defineOptions({
	inheritAttrs: false,
});

const props = withDefaults(defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(), {
	align: 'center',
	sideOffset: 4,
});
const emits = defineEmits<PopoverContentEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<PopoverPortal>
		<PopoverContent
			data-slot="popover-content"
			v-bind="{ ...forwarded, ...$attrs }"
			:class="
				cn(
					'z-50 w-72 origin-(--reka-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
					props.class
				)
			">
			<slot />
		</PopoverContent>
	</PopoverPortal>
</template>
