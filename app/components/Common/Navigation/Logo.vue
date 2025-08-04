<script setup lang="ts"></script>

<template>
	<div class="shine flex flex-row items-center gap-2 justify-self-start transition-all duration-300">
		<img src="/logo.svg" alt="CharaManagerV3 Logo" class="h-10 min-h-10 w-10 min-w-10" />
		<h1 class="text-md cursor-default font-bold md:text-xl">
			<a href="/">CharaManagerV3</a>
		</h1>
	</div>
</template>

<style scoped>
.shine:hover {
	--darkening: rgba(0, 0, 0, 0.6);
	--highlight: rgba(0, 0, 0, 1);
	mask-image: linear-gradient(-75deg, var(--darkening) 30%, var(--highlight) 50%, var(--darkening) 70%);
	mask-size: 200%;
	animation: shine 2s infinite linear;
	animation-direction: alternate;
}

@keyframes shine {
	from {
		mask-position: 150%;
	}

	to {
		mask-position: -50%;
	}
}
</style>
