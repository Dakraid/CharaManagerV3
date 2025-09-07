import type { z } from 'zod/v4';
import type { V2 } from 'character-card-utils';

// Server-specific Types
export type KeyOf<A extends any[]> = string | number | symbol;

export type ServiceEntry<S> = {
	service: S;
	timer: NodeJS.Timeout | undefined;
};

export type CreateServicePoolOptions<A extends any[], S, K extends KeyOf<A>> = {
	// How to compute the cache key from the arguments of useService(...args)
	keyFromArgs: (...args: A) => K;

	// How to create the service instance (sync or async)
	factory: (...args: A) => S | Promise<S>;

	// Dispose timeout in ms (reset on each access)
	ttlMs: number;

	// Optional cleanup for service before removal (e.g., close handles)
	onDispose?: (service: S, key: K) => void | Promise<void>;

	// Optional name for logs
	name?: string;
};

// Client-specific Types
export type PiniaStore<T extends (...args: any) => any> = Omit<
	ReturnType<T>,
	keyof ReturnType<typeof defineStore>
>;

// Application-wide Types
export type responseType = {
	statusCode: number;
	message: string;
}

export type Upload = z.infer<typeof uploadSchema>;

export type UploadProgress = {
	current: number;
	completed: number;
	failed: number;
	total: number;
};

export type UploadResult = { file_name: string; success: boolean; error?: string };

export type Character = {
	owner_id?: string;
	character_id: number;
	public_visible: boolean;
	character_name: string;
	upload_date: Date;
	image_etag: string;
	total_token_count: number;
	perma_token_count: number;
	evaluation_score: number;
	owned?: boolean;
};

export type Definition = {
	id: number;
	character_id: number;
	change_date: Date;
	content: V2;
	hash: string | null;
	name: string | null;
	description: string | null;
	personality: string | null;
	scenario: string | null;
}

export type FullCharacter = {
	character: Character;
	definition: Definition;
}

export type DefinitionParts = {
	description: string;
	first_mes?: string;
	personality?: string;
	scenario?: string;
	alternate_greetings?: string[];
}