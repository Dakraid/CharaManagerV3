<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner';
import 'vue-sonner/style.css';
</script>

<template>
	<div class="Viewport Viewport-Layout">
		<Toaster />
		<NuxtLayout>
			<NuxtPage />
		</NuxtLayout>
	</div>
</template>

<style scoped></style>
