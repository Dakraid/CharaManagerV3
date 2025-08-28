import type { z } from 'zod/v4';
import type { V2 } from 'character-card-utils';

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