<script setup lang="ts">
const appStore = useAppStore();
</script>

<template>
	<CommonNavigation class="Viewport-Navigation" />
	<Transition name="fade" mode="out-in">
		<CommonLoadingOverlay v-if="appStore.showOverlay" class="Viewport-Content" />
	</Transition>
	<main class="Viewport-Content">
		<slot />
	</main>
	<CommonFooter class="Viewport-Footer" />
</template>

<style scoped>
.Viewport-Navigation {
	grid-area: Navigation;
}

.Viewport-Content {
	grid-area: Content;
	overflow: hidden;
}

.Viewport-Footer {
	grid-area: Footer;
}
</style>
