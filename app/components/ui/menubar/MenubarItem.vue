<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { MenubarItem, useForwardPropsEmits } from 'reka-ui';
import type { MenubarItemEmits, MenubarItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<
	MenubarItemProps & {
		class?: HTMLAttributes['class'];
		inset?: boolean;
		variant?: 'default' | 'destructive';
	}
>();

const emits = defineEmits<MenubarItemEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'inset', 'variant');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<MenubarItem
		data-slot="menubar-item"
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
	</MenubarItem>
</template>
