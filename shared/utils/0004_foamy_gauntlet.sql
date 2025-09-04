ALTER TABLE "evaluations" DROP CONSTRAINT "evaluations_evaluationversion_check";--> statement-breakpoint
ALTER TABLE "evaluations" ALTER COLUMN "evaluation_version" SET DATA TYPE text;