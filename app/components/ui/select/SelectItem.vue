<script setup lang="ts">
import { Check } from 'lucide-vue-next';
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from 'reka-ui';
import type { SelectItemProps } from 'reka-ui';
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props;

	return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
	<SelectItem
		data-slot="select-item"
		v-bind="forwardedProps"
		:class="
			cn(
				`relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2`,
				props.class
			)
		">
		<span class="absolute right-2 flex size-3.5 items-center justify-center">
			<SelectItemIndicator>
				<Check class="size-4" />
			</SelectItemIndicator>
		</span>

		<SelectItemText>
			<slot />
		</SelectItemText>
	</SelectItem>
</template>
