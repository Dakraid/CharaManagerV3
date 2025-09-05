<script setup lang="ts">
defineEmits(['click']);
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<AlertDialog>
				<TooltipTrigger as-child>
					<AlertDialogTrigger as-child>
						<Button class="grow cursor-pointer" variant="destructive">
							<Icon name="lucide:shredder" size="1.5rem" />
						</Button>
					</AlertDialogTrigger>
				</TooltipTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription> This action cannot be undone. This will permanently delete the character and all its data from our servers. </AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction @click="$emit('click')">Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<TooltipContent side="bottom">
				<p>Delete</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>

<style scoped></style>
