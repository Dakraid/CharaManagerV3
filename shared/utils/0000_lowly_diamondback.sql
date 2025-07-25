CREATE EXTENSION IF NOT EXISTS pgcrypto;
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS vector;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION INSERT_USER (USERNAMEIN TEXT, EMAILIN TEXT, PASSWORDIN TEXT) RETURNS VOID AS $$
BEGIN
INSERT INTO public.users(
    username, email, password)
VALUES (UsernameIn, EMailIn, crypt(PasswordIn, gen_salt('bf', 12)));
END;
$$ LANGUAGE PLPGSQL;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION VERIFY_PASSWORD (LOGININ TEXT, PASSWORDIN TEXT) RETURNS BOOLEAN AS $$
	DECLARE passed BOOLEAN;
BEGIN
SELECT (password = crypt(PasswordIn, password)) INTO passed FROM public.users WHERE username = loginIn OR email = loginIn;
RETURN passed;
END;
$$ LANGUAGE PLPGSQL;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION HAS_ACCESS (USERID UUID, CHARACTERID INTEGER) RETURNS BOOLEAN AS $$
DECLARE
passed BOOLEAN;
BEGIN
SELECT TRUE INTO passed
FROM public.characters
WHERE (owner_id = USERID OR public_visible = true)
  AND character_id = CHARACTERID;
RETURN FOUND;
END;
$$ LANGUAGE PLPGSQL;
--> statement-breakpoint
CREATE TABLE "characters" (
	"owner_id" uuid NOT NULL,
	"character_id" serial PRIMARY KEY NOT NULL,
	"public_visible" boolean DEFAULT false NOT NULL,
	"character_name" text NOT NULL,
	"upload_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"image_etag" text NOT NULL,
	"total_token_count" integer DEFAULT 0 NOT NULL,
	"perma_token_count" integer DEFAULT 0 NOT NULL,
	"evaluation_score" integer DEFAULT 0 NOT NULL,
	"embeddings" vector(1024),
	CONSTRAINT "characters_totaltokencount_check" CHECK (total_token_count >= 0),
	CONSTRAINT "characters_permatokencount_check" CHECK (perma_token_count >= 0)
);
--> statement-breakpoint
CREATE TABLE "definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"character_id" integer NOT NULL,
	"change_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"content" jsonb NOT NULL,
	"name" text GENERATED ALWAYS AS (((content -> 'data'::text) ->> 'name'::text)) STORED,
	"description" text GENERATED ALWAYS AS (((content -> 'data'::text) ->> 'description'::text)) STORED,
	"personality" text GENERATED ALWAYS AS (((content -> 'data'::text) ->> 'personality'::text)) STORED,
	"scenario" text GENERATED ALWAYS AS (((content -> 'data'::text) ->> 'scenario'::text)) STORED
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"definition_id" integer NOT NULL,
	"evaluation_date" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"evaluation_version" integer NOT NULL,
	"evaluation_result" jsonb NOT NULL,
	CONSTRAINT "evaluations_evaluationversion_check" CHECK (evaluation_version > 0)
);
--> statement-breakpoint
CREATE TABLE "originals" (
	"character_id" integer PRIMARY KEY NOT NULL,
	"file_name" text NOT NULL,
	"file_origin" text NOT NULL,
	"fileraw" "text" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "relationships" (
	"parent_id" integer NOT NULL,
	"child_id" integer NOT NULL,
	CONSTRAINT "relationships_pkey" PRIMARY KEY("parent_id","child_id"),
	CONSTRAINT "relationships_check" CHECK (parent_id <> child_id)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_ownerid_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("character_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_definitionid_fkey" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "originals" ADD CONSTRAINT "originals_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("character_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_parentid_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."characters"("character_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_childid_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."characters"("character_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_characters_name" ON "characters" USING btree ("character_name" text_ops);--> statement-breakpoint
CREATE INDEX "idx_characters_owner" ON "characters" USING btree ("owner_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_characters_public" ON "characters" USING btree ("public_visible" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_definitions_change" ON "definitions" USING btree ("change_date" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_definitions_character" ON "definitions" USING btree ("character_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_definitions_search" ON "definitions" USING gin (to_tsvector('english', "description"));--> statement-breakpoint
CREATE INDEX "idx_evaluations_definition" ON "evaluations" USING btree ("definition_id" int4_ops);--> statement-breakpoint
CREATE INDEX "idx_relationships_child" ON "relationships" USING btree ("child_id" int4_ops);