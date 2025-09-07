<script setup lang="ts"></script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="outline" class="z-10 justify-self-end border duration-500 hover:*:rotate-360">
				<Icon name="lucide:cog" size="1.5rem" class="transition-all duration-1000" />
				<span class="sr-only">Show user menu</span>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end">
			<DropdownMenuLabel>
				<AuthMenu />
			</DropdownMenuLabel>
			<Separator class="mt-1" />
			<DropdownMenuLabel>
				<ControlTheme />
			</DropdownMenuLabel>
			<Separator class="mt-1" />
			<DropdownMenuLabel>
				<ControlGallery />
			</DropdownMenuLabel>
			<Separator class="mt-1" />
			<DropdownMenuLabel>
				<ControlCensor />
			</DropdownMenuLabel>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<style scoped></style>
