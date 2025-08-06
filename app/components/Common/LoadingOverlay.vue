<script setup lang="ts"></script>

<template>
	<div class="z-50 mx-auto grid h-full w-[calc(100%-var(--spacing)*8)] grid-cols-1 grid-rows-1 rounded-md">
		<div class="animate-pulse-overlay col-start-1 col-end-1 row-start-1 row-end-1 bg-background opacity-75"></div>
		<div class="col-start-1 col-end-1 row-start-1 row-end-1 backdrop-blur-xl"></div>
		<div class="col-start-1 col-end-1 row-start-1 row-end-1 flex flex-col items-center justify-center gap-4">
			<h1 class="text-4xl font-bold">Loading...</h1>
			<div>
				<Icon name="lucide:cog" size="5rem" class="animate-spin-overlay translate-x-3" />
				<Icon name="lucide:cog" size="5rem" class="animate-spin-reverse-overlay" />
				<Icon name="lucide:cog" size="5rem" class="animate-spin-overlay -translate-x-3" />
			</div>
		</div>
	</div>
</template>

<style scoped>
.animate-pulse-overlay {
	animation: pulse-overlay 3s ease-in-out infinite;
}

.animate-spin-overlay {
	animation: spin 3s linear infinite;
}

.animate-spin-reverse-overlay {
	animation: spin 3s linear infinite reverse;
	animation-delay: 0.1s;
}

@keyframes pulse-overlay {
	50% {
		opacity: 0.5;
	}
}
</style>
