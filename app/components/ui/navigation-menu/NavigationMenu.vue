<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import { NavigationMenuRoot, useForwardPropsEmits } from 'reka-ui';
import type { NavigationMenuRootEmits, NavigationMenuRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

import NavigationMenuViewport from './NavigationMenuViewport.vue';

const props = withDefaults(
	defineProps<
		NavigationMenuRootProps & {
			class?: HTMLAttributes['class'];
			viewport?: boolean;
		}
	>(),
	{
		viewport: true,
	}
);
const emits = defineEmits<NavigationMenuRootEmits>();

const delegatedProps = reactiveOmit(props, 'class', 'viewport');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
	<NavigationMenuRoot
		data-slot="navigation-menu"
		:data-viewport="viewport"
		v-bind="forwarded"
		:class="cn('group/navigation-menu relative flex flex-1 items-center justify-center p-4', props.class)">
		<slot />
		<NavigationMenuViewport v-if="viewport" />
	</NavigationMenuRoot>
</template>
