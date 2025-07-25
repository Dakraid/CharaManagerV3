import type { z } from 'zod/v4';

export type Upload = z.infer<typeof uploadSchema>;

export type UploadProgress = {
	current: number;
	completed: number;
	failed: number;
	total: number;
};

export type UploadResult = { file_name: string; success: boolean; error?: string };

export type CharacterList = { characterArray: Character[] };

export type Character = {
	character_id: number;
	public_visible: boolean;
	character_name: string;
	upload_date: Date;
	image_etag: string;
	total_token_count: number;
	perma_token_count: number;
	evaluation_score: number;
	owned: boolean;
};

export type CharacterWithOwnerId = {
	character_id: number;
	owner_id: string;
	public_visible: boolean;
	character_name: string;
	upload_date: Date;
	image_etag: string;
	total_token_count: number;
	perma_token_count: number;
	evaluation_score: number;
};
