<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';
</script>

<template>
	<div class="Viewport Viewport-Layout">
		<NuxtLayout>
			<NuxtPage
				:transition="{
					name: 'fade',
					mode: 'out-in',
				}" />
		</NuxtLayout>
		<Toaster position="top-right" />
	</div>
</template>

<style>
.page-enter-active,
.page-leave-active {
	transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
	opacity: 0;
	filter: blur(1rem);
}
</style>
