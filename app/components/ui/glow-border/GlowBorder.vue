<template>
	<ClientOnly>
		<div class="relative inline-block">
			<!-- Glow effect -->
			<div
				v-if="props.glow"
				:style="glowStyles"
				:class="
					cn(
						'pointer-events-none absolute inset-0 -z-10 size-full rounded-[inherit] opacity-50 blur-xl will-change-[background-position] motion-safe:animate-glow',
						props.glowClass
					)
				"></div>

			<!-- Border -->
			<div
				:style="borderStyles"
				:class="
					cn(
						'pointer-events-none absolute inset-0 size-full rounded-[inherit] will-change-[background-position] motion-safe:animate-glow',
						props.borderClass
					)
				"></div>

			<!-- Content slot with padding to show border -->
			<div :style="{ padding: `${props.borderWidth}px`, borderRadius: `${props.borderRadius}px` }">
				<slot />
			</div>
		</div>
	</ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { HTMLAttributes } from 'vue';
import { cn } from '~~/lib/utils';

interface Props {
	borderRadius?: number;
	color?: string | Array<string>;
	borderWidth?: number;
	duration?: number;
	glow?: boolean;
	glowIntensity?: number;
	class?: HTMLAttributes['class'];
	borderClass?: HTMLAttributes['class'];
	glowClass?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
	borderRadius: 10,
	color: '#FFF',
	borderWidth: 2,
	duration: 10,
	glow: true,
	glowIntensity: 1,
});

const gradientColors = computed(() => {
	return Array.isArray(props.color) ? props.color.join(',') : props.color;
});

const borderStyles = computed(() => {
	return {
		'--border-radius': `${props.borderRadius}px`,
		'--border-width': `${props.borderWidth}px`,
		'--duration': `${props.duration}s`,
		backgroundImage: `radial-gradient(transparent, transparent, ${gradientColors.value}, transparent, transparent)`,
		backgroundSize: '300% 300%',
		mask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
		WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
		WebkitMaskComposite: 'xor',
		maskComposite: 'exclude',
		padding: 'var(--border-width)',
		borderRadius: 'var(--border-radius)',
	};
});

const glowStyles = computed(() => {
	return {
		'--border-radius': `${props.borderRadius}px`,
		'--duration': `${props.duration}s`,
		backgroundImage: `radial-gradient(circle at center, ${gradientColors.value}, transparent 70%)`,
		backgroundSize: '300% 300%',
		borderRadius: 'var(--border-radius)',
		transform: `scale(${props.glowIntensity})`,
	};
});
</script>
