<script setup lang="ts">
import { cn } from '~~/lib/utils';

defineEmits(['click']);

defineProps<{
	singleWidth: boolean;
	downloading: boolean;
}>();
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger as-child>
				<Button :class="cn('grow cursor-pointer bg-accent-foreground', singleWidth ? '' : 'col-span-2')" :disabled="downloading" @click="$emit('click')">
					<Icon name="lucide:download" size="1.5rem" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>Download</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>

<style scoped></style>
