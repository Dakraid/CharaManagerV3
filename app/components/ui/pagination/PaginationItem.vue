<script setup lang="ts">
import { buttonVariants } from '@/components/ui/button';
import type { ButtonVariants } from '@/components/ui/button';
import { reactiveOmit } from '@vueuse/core';
import { PaginationListItem } from 'reka-ui';
import type { PaginationListItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

const props = withDefaults(
	defineProps<
		PaginationListItemProps & {
			size?: ButtonVariants['size'];
			class?: HTMLAttributes['class'];
			isActive?: boolean;
		}
	>(),
	{
		size: 'icon',
	}
);

const delegatedProps = reactiveOmit(props, 'class', 'size', 'isActive');
</script>

<template>
	<PaginationListItem
		data-slot="pagination-item"
		v-bind="delegatedProps"
		:class="
			cn(
				buttonVariants({
					variant: isActive ? 'outline' : 'ghost',
					size,
				}),
				props.class
			)
		">
		<slot />
	</PaginationListItem>
</template>
