<script setup lang="ts">
import { cn } from '~~/lib/utils';

const route = useRoute();
const appStore = useAppStore();

function isCurrentRoute(target: string) {
	return route.path === target ? 'bg-primary-foreground border' : '';
}
</script>

<template>
	<header :id="appStore.showNavigation ? 'navigation-open' : ''" class="navigation-layout mx-auto h-full w-full max-w-7xl gap-2 rounded-b-md border border-t-0 bg-background p-2 px-4 transition-all">
		<CommonNavigationLogo class="area-logo" />
		<NavigationMenu :id="appStore.showNavigation ? 'navigation-open' : ''" class="area-menu my-auto w-full p-0 *:w-full">
			<NavigationMenuList class="grid w-full grid-cols-3 gap-4">
				<NavigationMenuItem>
					<NavigationMenuLink :class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/'))" href="/">
						<Icon name="lucide:home" size="1.5rem" />
						<p>Home</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink :class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/relations'))" href="/">
						<Icon name="lucide:network" size="1.5rem" />
						<p>Relations</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink :class="cn('flex w-full flex-row items-center justify-center gap-2 transition-all', isCurrentRoute('/statistics'))" href="/">
						<Icon name="lucide:chart-area" size="1.5rem" />
						<p>Statistics</p>
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
		<div class="area-user flex flex-row items-center gap-2 justify-self-end">
			<CommonNavigationUserMenu />
			<Button variant="outline" class="z-10 justify-self-end border md:hidden" @click="appStore.toggleNavigation">
				<Icon name="lucide:menu" size="1.5rem" class="transition-all duration-1000" />
				<span class="sr-only">Show navigation</span>
			</Button>
		</div>
	</header>
</template>

<style scoped>
.navigation-layout {
	display: grid;
	grid-template-columns: minmax(max-content, 1fr) minmax(max-content, 1fr);
	grid-template-rows: minmax(max-content, 1fr);
	grid-template-areas: 'logo user';

	&#navigation-open {
		grid-template-rows: minmax(max-content, 1fr) minmax(max-content, 1fr);
		grid-template-areas:
			'logo user'
			'menu menu';
	}

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
	display: none;

	&#navigation-open {
		display: block;
	}

	@media (width >= 48rem) {
		display: block;
	}
}

.area-user {
	grid-area: user;
}
</style>
