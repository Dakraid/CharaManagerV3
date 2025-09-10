type NameResolver = (identifier: string) => string | undefined;

const EMPTY_ORDER: Order = { identifier: '', enabled: false };

/**
 * Align two Order arrays (left and right) by identifier or name (via optional resolver).
 * - Prioritizes the iteration order of one side ('left' or 'right').
 * - Never removes items; pads the opposite side with an empty Order when unmatched.
 * - Unmatched items are appended to the bottom in their original relative order.
 */
export function alignOrders(left: Order[], right: Order[], prioritize: string, nameResolver?: NameResolver): { left: Order[]; right: Order[] } {
	type Item = {
		order: Order;
		index: number;
		id: string;
		name?: string;
	};

	const buildItems = (arr: Order[]): Item[] =>
		arr.map((o, i) => ({
			order: { ...o },
			index: i,
			id: o.identifier ?? '',
			name: nameResolver ? nameResolver(o.identifier ?? '') : undefined,
		}));

	const leftItems = buildItems(left);
	const rightItems = buildItems(right);

	// Index maps for quick lookup (prefer identifier first, then name)
	const mapBy = (items: Item[]) => {
		const byId = new Map<string, number[]>(); // identifier -> indices (support duplicates)
		const byName = new Map<string, number[]>();
		for (const it of items) {
			if (it.id) {
				const arr = byId.get(it.id) ?? [];
				arr.push(it.index);
				byId.set(it.id, arr);
			}
			if (it.name) {
				const arr = byName.get(it.name) ?? [];
				arr.push(it.index);
				byName.set(it.name, arr);
			}
		}
		return { byId, byName };
	};

	const leftIdx = mapBy(leftItems);
	const rightIdx = mapBy(rightItems);

	const matchedLeft = new Set<number>();
	const matchedRight = new Set<number>();

	const tryMatch = (src: Item, otherItems: Item[], otherIdx: ReturnType<typeof mapBy>, otherMatched: Set<number>): number | undefined => {
		// Try by identifier first
		if (src.id) {
			const candidates = otherIdx.byId.get(src.id);
			if (candidates) {
				for (const idx of candidates) {
					if (!otherMatched.has(idx)) return idx;
				}
			}
		}
		// Fallback to name (if resolver provided and name exists)
		if (src.name) {
			const candidates = otherIdx.byName.get(src.name);
			if (candidates) {
				for (const idx of candidates) {
					if (!otherMatched.has(idx)) return idx;
				}
			}
		}
		return undefined;
	};

	const outLeft: Order[] = [];
	const outRight: Order[] = [];

	const drive = (driver: string) => {
		const primary = driver === 'left' ? leftItems : rightItems;
		const secondary = driver === 'left' ? rightItems : leftItems;
		const secondaryIdx = driver === 'left' ? rightIdx : leftIdx;
		const secondaryMatched = driver === 'left' ? matchedRight : matchedLeft;
		const primaryMatched = driver === 'left' ? matchedLeft : matchedRight;

		for (const p of primary) {
			const matchIdx = tryMatch(p, secondary, secondaryIdx, secondaryMatched);
			if (driver === 'left') {
				outLeft.push(p.order);
				if (matchIdx !== undefined && secondary[matchIdx]) {
					outRight.push(secondary[matchIdx].order);
					secondaryMatched.add(matchIdx);
				} else {
					outRight.push(EMPTY_ORDER);
				}
				primaryMatched.add(p.index);
			} else {
				// driver === 'right'
				outRight.push(p.order);
				if (matchIdx !== undefined && secondary[matchIdx]) {
					outLeft.push(secondary[matchIdx].order);
					secondaryMatched.add(matchIdx);
				} else {
					outLeft.push(EMPTY_ORDER);
				}
				primaryMatched.add(p.index);
			}
		}

		// Append any remaining unmatched from the secondary side in original order
		for (const s of secondary) {
			if (!secondaryMatched.has(s.index)) {
				if (driver === 'left') {
					outLeft.push(EMPTY_ORDER);
					outRight.push(s.order);
				} else {
					outLeft.push(s.order);
					outRight.push(EMPTY_ORDER);
				}
				secondaryMatched.add(s.index);
			}
		}
	};

	drive(prioritize);

	return { left: outLeft, right: outRight };
}
