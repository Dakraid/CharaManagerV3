CREATE TABLE "credentials" (
	"user_id" uuid NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"backed_up" boolean DEFAULT false NOT NULL,
	"transports" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" DROP CONSTRAINT "characters_totaltokencount_check";--> statement-breakpoint
ALTER TABLE "characters" DROP CONSTRAINT "characters_permatokencount_check";--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_evaluationversion_check";--> statement-breakpoint
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_check";--> statement-breakpoint
ALTER TABLE "definitions" DROP CONSTRAINT "definitions_characterid_fkey";
--> statement-breakpoint
ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_definitionid_fkey";
--> statement-breakpoint
ALTER TABLE "originals" DROP CONSTRAINT "originals_characterid_fkey";
--> statement-breakpoint
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_parentid_fkey";
--> statement-breakpoint
ALTER TABLE "relationships" DROP CONSTRAINT "relationships_childid_fkey";
--> statement-breakpoint
DROP INDEX "idx_definitions_search";--> statement-breakpoint
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_userid_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "definitions" ADD CONSTRAINT "definitions_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("character_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_definitionid_fkey" FOREIGN KEY ("definition_id") REFERENCES "public"."definitions"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "originals" ADD CONSTRAINT "originals_characterid_fkey" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("character_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_parentid_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."characters"("character_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_childid_fkey" FOREIGN KEY ("child_id") REFERENCES "public"."characters"("character_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_definitions_search" ON "definitions" USING gin (to_tsvector
            ('english',
            "description"
            ));--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_totaltokencount_check" CHECK (total_token_count
            >= 0);--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_permatokencount_check" CHECK (perma_token_count
            >= 0);--> statement-breakpoint
ALTER TABLE "evaluations" ADD CONSTRAINT "evaluations_evaluationversion_check" CHECK (evaluation_version
            > 0);--> statement-breakpoint
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_check" CHECK (parent_id
            <> child_id);