<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { MenubarCheckboxItem, MenubarItemIndicator, useForwardPropsEmits } from 'reka-ui';
import type { MenubarCheckboxItemEmits, MenubarCheckboxItemProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<MenubarCheckboxItemProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<MenubarCheckboxItemEmits>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<MenubarCheckboxItem
		data-slot="menubar-checkbox-item"
		v-bind="forwarded"
		:class="
			cn(
				`relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
				props.class
			)
		">
		<span class="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
			<MenubarItemIndicator>
				<Check class="size-4" />
			</MenubarItemIndicator>
		</span>
		<slot />
	</MenubarCheckboxItem>
</template>
