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

export type missingCharacter = {
	id: number;
	content: any;
	description: string | null;
	personality: string | null;
	scenario: string | null;
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
	lorebooks?: Lorebook[];
}


export type DefinitionParts = {
	description: string;
	first_mes?: string;
	personality?: string;
	scenario?: string;
	alternate_greetings?: string[];
}

export interface Entry {
	keys: string[];
	content: string;
	extensions: { [key: string]: any };
	enabled: boolean;
	insertion_order: number;
	case_sensitive?: boolean;
	name?: string;
	priority?: number;
	id?: number;
	comment?: string;
	selective?: boolean;
	secondary_keys?: string[];
	constant?: boolean;
	position?: 'before_char' | 'after_char';
}

export interface CharacterBook {
	name?: string;
	description?: string;
	scan_depth?: number;
	token_budget?: number;
	recursive_scanning?: boolean;
	extensions: { [key: string]: any };
	entries: Entry[];
}

export type Lorebook = {
	id: number;
	user_id: string;
	name: string | null;
	description: string | null;
	scan_depth: number | null;
	token_budget: number | null;
	recursive_scanning: boolean | null;
	extensions: any | null;
	entries: Entry[];
	entry_count?: number;
	create_date: Date;
	update_date: Date;
};
