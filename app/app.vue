<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';

const appStore = useAppStore();
</script>

<template>
	<div :id="appStore.showNavigation ? 'navigation-open' : ''" class="Viewport Viewport-Layout">
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
.Viewport {
	height: 100vh;
	max-height: 100vh;
	min-height: 100vh;
	width: 100vw;
	max-width: 100vw;
	min-width: 100vw;
	overflow: hidden;
}

.Viewport-Layout {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: calc(var(--spacing) * 17) calc(var(--spacing) * 4) 1fr calc(var(--spacing) * 4) calc(var(--spacing) * 8);
	gap: 0;
	grid-auto-flow: row;
	grid-template-areas:
		'Navigation'
		'.'
		'Content'
		'.'
		'Footer';

	&#navigation-open {
		grid-template-rows: calc(var(--spacing) * 32) calc(var(--spacing) * 4) 1fr calc(var(--spacing) * 4) calc(var(--spacing) * 8);
	}

	@media (width >= 48rem) {
		grid-template-rows: calc(var(--spacing) * 16) calc(var(--spacing) * 4) 1fr calc(var(--spacing) * 4) calc(var(--spacing) * 8);
	}
}

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
