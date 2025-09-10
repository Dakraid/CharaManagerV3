export function orderPromptsByPreset(preset: ChatCompletionPreset, setOrder?: Order[]) {
	const promptMap = new Map<string, Prompt>();
	for (const p of preset.prompts) {
		promptMap.set(p.identifier, p);
	}

	const added = new Set<string>();
	const result: Prompt[] = [];

	const promptOrder = getLargestPromptOrder(preset.prompt_order);

	if (!promptOrder) {
		console.error('No prompt order found in preset.');
		return;
	}

	const order = setOrder ?? promptOrder.order;
	for (const item of order) {
		if (added.has(item.identifier)) continue;

		const prompt = promptMap.get(item.identifier);
		if (!prompt) continue;

		result.push(prompt);
		added.add(item.identifier);
	}

	for (const p of preset.prompts) {
		if (added.has(p.identifier)) continue;
		result.push(p);
		added.add(p.identifier);
	}

	return result;
}
