<script setup lang="ts">
defineEmits(['click']);

defineProps<{
	visibility: boolean;
}>();
</script>

<template>
	<TooltipProvider>
		<Tooltip>
			<AlertDialog>
				<TooltipTrigger as-child>
					<AlertDialogTrigger as-child>
						<Button variant="ghost" size="icon" class="mx-auto cursor-pointer">
							<Transition name="fade" mode="out-in">
								<Icon v-if="visibility" name="lucide:eye" size="1.5rem" />
								<Icon v-else name="lucide:eye-closed" size="1.5rem" />
							</Transition>
						</Button>
					</AlertDialogTrigger>
				</TooltipTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This will change the visibility of your character.<br />
							If set to public, anyone can view and download your character.<br />
							If set to private, only you can view and download your character.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction @click="$emit('click')">Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
			<TooltipContent side="top">
				<p>
					Current visibility is <b>{{ visibility ? 'Public' : 'Private' }}</b>
				</p>
				<p>
					Click to change to <b>{{ visibility ? 'Private' : 'Public' }}</b>
				</p>
			</TooltipContent>
		</Tooltip>
	</TooltipProvider>
</template>

<style scoped></style>
