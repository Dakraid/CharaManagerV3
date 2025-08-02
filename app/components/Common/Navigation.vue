<script setup lang="ts">
import { cn } from '~~/lib/utils';

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

function isCurrentRoute(target: string) {
	return route.path === target ? 'bg-primary-foreground border' : '';
}
</script>

<template>
	<header
		class="layout fixed inset-x-0 top-4 z-20 grid h-32 w-full max-w-7xl items-center justify-items-center gap-2 border bg-background p-2 px-4 transition-all md:mx-auto md:h-16 md:rounded-md">
		<CommonNavigationLogo class="area-logo" />
		<NavigationMenu class="area-menu w-full p-0 *:w-full">
			<NavigationMenuList class="grid w-full grid-cols-3 gap-4">
				<NavigationMenuItem>
					<NavigationMenuLink :class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/'))" href="/">
						<Icon name="lucide:home" size="1.5rem" />
						<p>Home</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink
						:class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/relations'))"
						href="/">
						<Icon name="lucide:network" size="1.5rem" />
						<p>Relations</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink
						:class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/statistics'))"
						href="/">
						<Icon name="lucide:chart-area" size="1.5rem" />
						<p>Statistics</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<div class="area-user flex flex-row items-center gap-2 justify-self-end">
			<CommonNavigationDebugMenu />
			<CommonNavigationUserMenu />
		</div>
	</header>
</template>

<style scoped>
.layout {
	grid-template-columns: minmax(max-content, 1fr) minmax(max-content, 1fr);
	grid-template-rows: minmax(max-content, 1fr) minmax(max-content, 1fr);
	grid-template-areas:
		'logo user'
		'menu menu';

	@media (width >= 48rem) {
		grid-template-columns: minmax(max-content, 1fr) auto minmax(max-content, 1fr);
		grid-template-rows: minmax(max-content, 1fr);
		grid-template-areas: 'logo menu user';
	}
}

.area-logo {
	grid-area: logo;
}

.area-menu {
	grid-area: menu;
}

.area-user {
	grid-area: user;
}
</style>
