<script setup lang="ts">
defineEmits(['click', 'mouseover']);
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<TooltipTrigger as-child>
				<Button class="grow cursor-pointer" variant="secondary" @click="$emit('click')" @mouseover="$emit('mouseover')">
					<Icon name="lucide:notebook-pen" size="1.5rem" />
				</Button>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p>Edit</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>

<style scoped></style>
