<script setup lang="ts">
import { ContextMenuItem, useForwardPropsEmits } from 'reka-ui';
import type { ContextMenuItemEmits, ContextMenuItemProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = withDefaults(
	defineProps<
		ContextMenuItemProps & {
			class?: HTMLAttributes['class'];
			inset?: boolean;
			variant?: 'default' | 'destructive';
		}
	>(),
	{
		variant: 'default',
	}
);
const emits = defineEmits<ContextMenuItemEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<ContextMenuItem
		data-slot="context-menu-item"
		:data-inset="inset ? '' : undefined"
		:data-variant="variant"
		v-bind="forwarded"
		:class="
			cn(
				`relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive-foreground data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive-foreground dark:data-[variant=destructive]:focus:bg-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:!text-destructive-foreground`,
				props.class
			)
		">
		<slot />
	</ContextMenuItem>
</template>
