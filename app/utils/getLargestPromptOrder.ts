export function getLargestPromptOrder(promptOrders: PromptOrder[]): PromptOrder | undefined {
	if (promptOrders.length === 0) return undefined;

	return promptOrders.reduce<PromptOrder | undefined>((max, current) => {
		const maxLen = max?.order?.length ?? 0;
		const curLen = current.order?.length ?? 0;
		return curLen > maxLen ? current : max;
	}, promptOrders[0]);
}
