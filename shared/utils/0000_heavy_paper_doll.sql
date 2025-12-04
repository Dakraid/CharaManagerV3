CREATE EXTENSION IF NOT EXISTS PGCRYPTO;

--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS VECTOR;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION INSERT_USER (USERNAMEIN TEXT, EMAILIN TEXT, PASSWORDIN TEXT) RETURNS VOID AS $$
begin
    insert into public.users(username, email, password) values (UsernameIn, EMailIn, crypt(PasswordIn, gen_salt('bf', 12)));
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION VERIFY_PASSWORD (LOGININ TEXT, PASSWORDIN TEXT) RETURNS BOOLEAN AS $$
declare
    passed BOOLEAN;
begin
    select (password = crypt(PasswordIn, password)) into passed from public.users where username = loginIn or email = loginIn;
    return passed;
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION HAS_READ_ACCESS (USERID UUID, CHARACTERID INTEGER) RETURNS BOOLEAN AS $$
declare
    passed BOOLEAN;
begin
    select true into passed from public.characters where (owner_id = USERID or public_visible = true) and character_id = CHARACTERID;
    return FOUND;
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION HAS_WRITE_ACCESS (USERID UUID, CHARACTERID INTEGER) RETURNS BOOLEAN AS $$
declare
    passed BOOLEAN;
begin
    select true into passed from public.characters where owner_id = USERID and character_id = CHARACTERID;
    return FOUND;
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION HASH_CONTENT (CONTENT TEXT) RETURNS TEXT AS $$
declare
    output TEXT;
begin
    select (encode(digest(CONTENT, 'sha256'), 'hex')) into output;
    return output;
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE OR REPLACE FUNCTION GET_TAGS_FROM_DEFINITIONS () RETURNS TABLE (TAG TEXT) AS $$
begin
    return query select distinct upper(t.tag)
                 from definitions d
                          cross join lateral jsonb_array_elements_text(case when jsonb_typeof(d.content -> 'data' -> 'tags') = 'array' then d.content -> 'data' -> 'tags' else '[]'::jsonb end) as t(tag);
end;
$$ LANGUAGE PLPGSQL;

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "characters" (
                                            "owner_id" UUID NOT NULL,
                                            "character_id" SERIAL PRIMARY KEY NOT NULL,
                                            "public_visible" BOOLEAN DEFAULT FALSE NOT NULL,
                                            "character_name" TEXT NOT NULL,
                                            "upload_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                            "image_etag" TEXT NOT NULL,
                                            "total_token_count" INTEGER DEFAULT 0 NOT NULL,
                                            "perma_token_count" INTEGER DEFAULT 0 NOT NULL,
                                            "evaluation_score" INTEGER DEFAULT 0 NOT NULL,
                                            "embeddings" VECTOR (1024),
                                            "character_tags" TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
                                            CONSTRAINT "characters_totaltokencount_check" CHECK (TOTAL_TOKEN_COUNT >= 0),
                                            CONSTRAINT "characters_permatokencount_check" CHECK (PERMA_TOKEN_COUNT >= 0)
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "definitions" (
                                             "id" SERIAL PRIMARY KEY NOT NULL,
                                             "character_id" INTEGER NOT NULL,
                                             "change_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                             "content" JSONB NOT NULL,
                                             "name" TEXT GENERATED ALWAYS AS (((CONTENT -> 'data'::TEXT) ->> 'name'::TEXT)) STORED,
                                             "description" TEXT GENERATED ALWAYS AS (
                                                 ((CONTENT -> 'data'::TEXT) ->> 'description'::TEXT)
                                                 ) STORED,
                                             "personality" TEXT GENERATED ALWAYS AS (
                                                 ((CONTENT -> 'data'::TEXT) ->> 'personality'::TEXT)
                                                 ) STORED,
                                             "scenario" TEXT GENERATED ALWAYS AS (((CONTENT -> 'data'::TEXT) ->> 'scenario'::TEXT)) STORED,
                                             "hash" TEXT GENERATED ALWAYS AS (
                                                 ENCODE(DIGEST (CONTENT #>> '{}', 'sha256'), 'hex')
                                                 ) STORED
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "evaluations" (
                                             "id" SERIAL PRIMARY KEY NOT NULL,
                                             "definition_id" INTEGER NOT NULL,
                                             "evaluation_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                             "evaluation_version" TEXT NOT NULL,
                                             "evaluation_result" JSONB NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "originals" (
                                           "character_id" INTEGER PRIMARY KEY NOT NULL,
                                           "file_name" TEXT NOT NULL,
                                           "file_origin" TEXT NOT NULL,
                                           "file_raw" "text" NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "relationships" (
                                               "parent_id" INTEGER NOT NULL,
                                               "child_id" INTEGER NOT NULL,
                                               CONSTRAINT "relationships_pkey" PRIMARY KEY ("parent_id", "child_id"),
                                               CONSTRAINT "relationships_check" CHECK (PARENT_ID <> CHILD_ID)
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
                                       "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID() NOT NULL,
                                       "username" TEXT NOT NULL,
                                       "email" TEXT NOT NULL,
                                       "password" TEXT NOT NULL,
                                       CONSTRAINT "users_username_key" UNIQUE ("username"),
                                       CONSTRAINT "users_email_key" UNIQUE ("email")
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tags" (
                                      "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID() NOT NULL,
                                      "tag" TEXT NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "credentials" (
                                             "user_id" UUID NOT NULL,
                                             "id" UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID() NOT NULL,
                                             "public_key" TEXT NOT NULL,
                                             "counter" INTEGER NOT NULL,
                                             "backed_up" BOOLEAN DEFAULT FALSE NOT NULL,
                                             "transports" TEXT NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lorebooks" (
                                           "id" SERIAL PRIMARY KEY NOT NULL,
                                           "user_id" UUID NOT NULL,
                                           "name" TEXT,
                                           "description" TEXT,
                                           "scan_depth" INTEGER,
                                           "token_budget" INTEGER,
                                           "recursive_scanning" BOOLEAN DEFAULT FALSE,
                                           "extensions" JSONB DEFAULT '{}'::JSONB,
                                           "entries" JSONB NOT NULL,
                                           "create_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                           "update_date" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "character_lorebooks" (
                                                     "character_id" INTEGER NOT NULL,
                                                     "lorebook_id" INTEGER NOT NULL,
                                                     CONSTRAINT "character_lorebooks_pkey" PRIMARY KEY ("character_id", "lorebook_id")
);

--> statement-breakpoint
ALTER TABLE "characters"
    DROP CONSTRAINT IF EXISTS "characters_ownerid_fkey";

--> statement-breakpoint
ALTER TABLE "characters"
    ADD CONSTRAINT "characters_ownerid_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "definitions"
    DROP CONSTRAINT IF EXISTS "definitions_characterid_fkey";

--> statement-breakpoint
ALTER TABLE "definitions"
    ADD CONSTRAINT "definitions_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters" ("character_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "evaluations"
    DROP CONSTRAINT IF EXISTS "evaluations_definitionid_fkey";

--> statement-breakpoint
ALTER TABLE "evaluations"
    ADD CONSTRAINT "evaluations_definitionid_fkey" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "originals"
    DROP CONSTRAINT IF EXISTS "originals_characterid_fkey";

--> statement-breakpoint
ALTER TABLE "originals"
    ADD CONSTRAINT "originals_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters" ("character_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "relationships"
    DROP CONSTRAINT IF EXISTS "relationships_parentid_fkey";

--> statement-breakpoint
ALTER TABLE "relationships"
    ADD CONSTRAINT "relationships_parentid_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."characters" ("character_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "relationships"
    DROP CONSTRAINT IF EXISTS "relationships_childid_fkey";

--> statement-breakpoint
ALTER TABLE "relationships"
    ADD CONSTRAINT "relationships_childid_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."characters" ("character_id") ON DELETE NO ACTION ON UPDATE NO ACTION;

--> statement-breakpoint
ALTER TABLE "credentials"
    DROP CONSTRAINT IF EXISTS "credentials_userid_fkey";

--> statement-breakpoint
ALTER TABLE "credentials"
    ADD CONSTRAINT "credentials_userid_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "definitions"
    DROP CONSTRAINT IF EXISTS "definitions_characterid_fkey";

--> statement-breakpoint
ALTER TABLE "definitions"
    ADD CONSTRAINT "definitions_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters" ("character_id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "evaluations"
    DROP CONSTRAINT IF EXISTS "evaluations_definitionid_fkey";

--> statement-breakpoint
ALTER TABLE "evaluations"
    ADD CONSTRAINT "evaluations_definitionid_fkey" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "originals"
    DROP CONSTRAINT IF EXISTS "originals_characterid_fkey";

--> statement-breakpoint
ALTER TABLE "originals"
    ADD CONSTRAINT "originals_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters" ("character_id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "relationships"
    DROP CONSTRAINT IF EXISTS "relationships_parentid_fkey";

--> statement-breakpoint
ALTER TABLE "relationships"
    ADD CONSTRAINT "relationships_parentid_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."characters" ("character_id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "relationships"
    DROP CONSTRAINT IF EXISTS "relationships_childid_fkey";

--> statement-breakpoint
ALTER TABLE "relationships"
    ADD CONSTRAINT "relationships_childid_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."characters" ("character_id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "characters"
    DROP CONSTRAINT IF EXISTS "characters_totaltokencount_check";

--> statement-breakpoint
ALTER TABLE "characters"
    ADD CONSTRAINT "characters_totaltokencount_check" CHECK (TOTAL_TOKEN_COUNT >= 0);

--> statement-breakpoint
ALTER TABLE "characters"
    DROP CONSTRAINT IF EXISTS "characters_permatokencount_check";

--> statement-breakpoint
ALTER TABLE "characters"
    ADD CONSTRAINT "characters_permatokencount_check" CHECK (PERMA_TOKEN_COUNT >= 0);

--> statement-breakpoint
ALTER TABLE "relationships"
    DROP CONSTRAINT IF EXISTS "relationships_check";

--> statement-breakpoint
ALTER TABLE "relationships"
    ADD CONSTRAINT "relationships_check" CHECK (PARENT_ID <> CHILD_ID);

--> statement-breakpoint
ALTER TABLE "character_lorebooks"
    ADD CONSTRAINT "character_lorebooks_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters" ("character_id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "character_lorebooks"
    ADD CONSTRAINT "character_lorebooks_lorebookid_fkey" FOREIGN KEY ("lorebook_id") REFERENCES "public"."lorebooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
ALTER TABLE "lorebooks"
    ADD CONSTRAINT "lorebooks_userid_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_characters_name";

--> statement-breakpoint
CREATE INDEX "idx_characters_name" ON "characters" USING BTREE ("character_name" TEXT_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_characters_owner";

--> statement-breakpoint
CREATE INDEX "idx_characters_owner" ON "characters" USING BTREE ("owner_id" UUID_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_characters_public";

--> statement-breakpoint
CREATE INDEX "idx_characters_public" ON "characters" USING BTREE ("public_visible" BOOL_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_definitions_change";

--> statement-breakpoint
CREATE INDEX "idx_definitions_change" ON "definitions" USING BTREE ("change_date" TIMESTAMPTZ_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_definitions_character";

--> statement-breakpoint
CREATE INDEX "idx_definitions_character" ON "definitions" USING BTREE ("character_id" INT4_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_definitions_search";

--> statement-breakpoint
CREATE INDEX "idx_definitions_search" ON "definitions" USING GIN (TO_TSVECTOR('english', "description"));

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_evaluations_definition";

--> statement-breakpoint
CREATE INDEX "idx_evaluations_definition" ON "evaluations" USING BTREE ("definition_id" INT4_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_relationships_child";

--> statement-breakpoint
CREATE INDEX "idx_relationships_child" ON "relationships" USING BTREE ("child_id" INT4_OPS);

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_definitions_search";

--> statement-breakpoint
CREATE INDEX "idx_definitions_search" ON "definitions" USING GIN (TO_TSVECTOR('english', "description"));

--> statement-breakpoint
DROP INDEX IF EXISTS "idx_lorebooks_user";

--> statement-breakpoint
CREATE INDEX "idx_lorebooks_user" ON "lorebooks" USING BTREE ("user_id" UUID_OPS);
