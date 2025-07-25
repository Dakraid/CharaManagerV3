import { relations } from 'drizzle-orm/relations';

import { characters, definitions, evaluations, originals, relationships, users } from './schema';

export const definitionsRelations = relations(definitions, ({ one, many }) => ({
	character: one(characters, {
		fields: [definitions.character_id],
		references: [characters.character_id],
	}),
	evaluations: many(evaluations),
}));

export const charactersRelations = relations(characters, ({ one, many }) => ({
	definitions: many(definitions),
	user: one(users, {
		fields: [characters.owner_id],
		references: [users.id],
	}),
	originals: many(originals),
	relationships_parentid: many(relationships, {
		relationName: 'relationships_parentid_characters_characterid',
	}),
	relationships_childid: many(relationships, {
		relationName: 'relationships_childid_characters_characterid',
	}),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
	definition: one(definitions, {
		fields: [evaluations.definition_id],
		references: [definitions.id],
	}),
}));

export const usersRelations = relations(users, ({ many }) => ({
	characters: many(characters),
}));

export const originalsRelations = relations(originals, ({ one }) => ({
	character: one(characters, {
		fields: [originals.character_id],
		references: [characters.character_id],
	}),
}));

export const relationshipsRelations = relations(relationships, ({ one }) => ({
	character_parentid: one(characters, {
		fields: [relationships.parent_id],
		references: [characters.character_id],
		relationName: 'relationships_parentid_characters_characterid',
	}),
	character_childid: one(characters, {
		fields: [relationships.child_id],
		references: [characters.character_id],
		relationName: 'relationships_childid_characters_characterid',
	}),
}));
