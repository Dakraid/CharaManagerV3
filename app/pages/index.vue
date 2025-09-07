<!--suppress CssUnusedSymbol -->
<script setup lang="ts">
import { cn } from '~~/lib/utils';

const { loggedIn } = useUserSession();
const clientService = useClientService();

onMounted(async () => {
	await clientService.getCharacters();
});
</script>

<template>
	<div class="h-full w-full">
		<div :class="cn('Gallery-Layout h-full w-full px-4', loggedIn ? '' : 'Gallery-Layout-NoActions')">
			<CharacterGallery />
		</div>
	</div>
</template>

<style scoped></style>
