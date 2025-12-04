import type { V2 } from 'character-card-utils';
import { sql } from 'drizzle-orm';
import { boolean, check, customType, foreignKey, index, integer, jsonb, pgTable, primaryKey, serial, text, timestamp, unique, uuid, vector } from 'drizzle-orm/pg-core';

export const binary = customType<{
	data: Buffer;
	default: false;
}>({
	dataType() {
		return 'bytea';
	},
});

export const definitions = pgTable(
	'definitions',
	{
		id: serial().primaryKey().notNull(),
		character_id: integer().notNull(),
		change_date: timestamp({ withTimezone: true, mode: 'date' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		content: jsonb().$type<V2>().notNull(),
		hash: text().generatedAlwaysAs(sql`encode(digest(content #>> '{}', 'sha256'), 'hex')`),
		name: text().generatedAlwaysAs(sql`((content -> 'data'::text) ->> 'name'::text)`),
		description: text().generatedAlwaysAs(sql`((content -> 'data'::text) ->> 'description'::text)`),
		personality: text().generatedAlwaysAs(sql`((content -> 'data'::text) ->> 'personality'::text)`),
		scenario: text().generatedAlwaysAs(sql`((content -> 'data'::text) ->> 'scenario'::text)`),
	},
	(table) => [
		index('idx_definitions_change').using('btree', table.change_date.desc().nullsFirst().op('timestamptz_ops')),
		index('idx_definitions_character').using('btree', table.character_id.asc().nullsLast().op('int4_ops')),
		index('idx_definitions_search').using(
			'gin',
			sql`to_tsvector
            ('english',
            ${table.description}
            )`
		),
		foreignKey({
			columns: [table.character_id],
			foreignColumns: [characters.character_id],
			name: 'definitions_characterid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);

export const evaluations = pgTable(
	'evaluations',
	{
		id: serial().primaryKey().notNull(),
		definition_id: integer().notNull(),
		evaluation_date: timestamp({ withTimezone: true, mode: 'date' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		evaluation_version: text().notNull(),
		evaluation_result: jsonb().notNull(),
	},
	(table) => [
		index('idx_evaluations_definition').using('btree', table.definition_id.asc().nullsLast().op('int4_ops')),
		foreignKey({
			columns: [table.definition_id],
			foreignColumns: [definitions.id],
			name: 'evaluations_definitionid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);

export const users = pgTable(
	'users',
	{
		id: uuid().defaultRandom().primaryKey().notNull(),
		username: text().notNull(),
		email: text().notNull(),
		password: text().notNull(),
	},
	(table) => [unique('users_username_key').on(table.username), unique('users_email_key').on(table.email)]
);

export const credentials = pgTable(
	'credentials',
	{
		user_id: uuid().notNull(),
		id: uuid().defaultRandom().primaryKey().notNull(),
		public_key: text().notNull(),
		counter: integer().notNull(),
		backed_up: boolean().default(false).notNull(),
		transports: text().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: 'credentials_userid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);

export const characters = pgTable(
	'characters',
	{
		owner_id: uuid().notNull(),
		character_id: serial().primaryKey().notNull(),
		public_visible: boolean().default(false).notNull(),
		character_name: text().notNull(),
		upload_date: timestamp({ withTimezone: true, mode: 'date' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		image_etag: text().notNull(),
		total_token_count: integer().default(0).notNull(),
		perma_token_count: integer().default(0).notNull(),
		evaluation_score: integer().default(0).notNull(),
		character_tags: text()
			.array()
			.default(sql`ARRAY[]::text[]`)
			.notNull(),
		embeddings: vector({ dimensions: 1024 }),
	},
	(table) => [
		index('idx_characters_name').using('btree', table.character_name.asc().nullsLast().op('text_ops')),
		index('idx_characters_owner').using('btree', table.owner_id.asc().nullsLast().op('uuid_ops')),
		index('idx_characters_public').using('btree', table.public_visible.asc().nullsLast().op('bool_ops')),
		foreignKey({
			columns: [table.owner_id],
			foreignColumns: [users.id],
			name: 'characters_ownerid_fkey',
		}),
		check(
			'characters_totaltokencount_check',
			sql`total_token_count
            >= 0`
		),
		check(
			'characters_permatokencount_check',
			sql`perma_token_count
            >= 0`
		),
	]
);

export const originals = pgTable(
	'originals',
	{
		character_id: integer().primaryKey().notNull(),
		file_name: text().notNull(),
		file_origin: text().notNull(),
		file_raw: text().notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.character_id],
			foreignColumns: [characters.character_id],
			name: 'originals_characterid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);

export const relationships = pgTable(
	'relationships',
	{
		parent_id: integer().notNull(),
		child_id: integer().notNull(),
	},
	(table) => [
		index('idx_relationships_child').using('btree', table.child_id.asc().nullsLast().op('int4_ops')),
		foreignKey({
			columns: [table.parent_id],
			foreignColumns: [characters.character_id],
			name: 'relationships_parentid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({
			columns: [table.child_id],
			foreignColumns: [characters.character_id],
			name: 'relationships_childid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		primaryKey({ columns: [table.parent_id, table.child_id], name: 'relationships_pkey' }),
		check(
			'relationships_check',
			sql`parent_id
            <> child_id`
		),
	]
);

export const tags = pgTable('tags', {
	id: uuid().defaultRandom().primaryKey().notNull(),
	tag: text().notNull(),
});

export const lorebooks = pgTable(
	'lorebooks',
	{
		id: serial().primaryKey().notNull(),
		user_id: uuid().notNull(),
		name: text(),
		description: text(),
		scan_depth: integer(),
		token_budget: integer(),
		recursive_scanning: boolean().default(false),
		extensions: jsonb().default({}),
		entries: jsonb().notNull(),
		create_date: timestamp({ withTimezone: true, mode: 'date' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
		update_date: timestamp({ withTimezone: true, mode: 'date' })
			.default(sql`CURRENT_TIMESTAMP`)
			.notNull(),
	},
	(table) => [
		index('idx_lorebooks_user').using('btree', table.user_id.asc().nullsLast().op('uuid_ops')),
		foreignKey({
			columns: [table.user_id],
			foreignColumns: [users.id],
			name: 'lorebooks_userid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);

export const character_lorebooks = pgTable(
	'character_lorebooks',
	{
		character_id: integer().notNull(),
		lorebook_id: integer().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.character_id, table.lorebook_id], name: 'character_lorebooks_pkey' }),
		foreignKey({
			columns: [table.character_id],
			foreignColumns: [characters.character_id],
			name: 'character_lorebooks_characterid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
		foreignKey({
			columns: [table.lorebook_id],
			foreignColumns: [lorebooks.id],
			name: 'character_lorebooks_lorebookid_fkey',
		})
			.onDelete('cascade')
			.onUpdate('cascade'),
	]
);
