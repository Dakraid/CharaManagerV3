export function orderPromptsByPreset(preset: ChatCompletionPreset, setOrder?: Order[]) {
	const promptMap = new Map<string, Prompt>();
	for (const p of preset.prompts) {
		promptMap.set(p.identifier, p);
	}

	const added = new Set<string>();
	const result: Prompt[] = [];

	const promptOrder = getLargestPromptOrder(preset.prompt_order);

	if (!promptOrder && !setOrder) {
		console.error('No prompt order found in preset.');
		return [];
	}

	let placeholderIndex = 0;
	const makePlaceholder = (): Prompt => ({
		identifier: `__empty__${placeholderIndex++}`,
		name: '(empty)',
		enabled: false,
		marker: true,
		system_prompt: false,
	});

	const order = setOrder ?? promptOrder!.order;
	for (const item of order) {
		// Only dedupe real identifiers; allow multiple empty/placeholder slots
		if (item.identifier && added.has(item.identifier)) continue;

		const prompt = item.identifier ? promptMap.get(item.identifier) : undefined;
		if (!prompt) {
			// Insert a placeholder to preserve alignment for unmatched or empty order entries
			result.push(makePlaceholder());
			continue;
		}

		result.push(prompt);
		added.add(item.identifier);
	}

	// Append any remaining prompts that were not listed in the order (stable)
	for (const p of preset.prompts) {
		if (added.has(p.identifier)) continue;
		result.push(p);
		added.add(p.identifier);
	}

	return result;
}
