ALTER TABLE "reports" ALTER COLUMN "priority" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "priority" SET DEFAULT 'sedang'::text;--> statement-breakpoint
DROP TYPE "public"."report_priority";--> statement-breakpoint
CREATE TYPE "public"."report_priority" AS ENUM('rendah', 'sedang', 'tinggi');--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "priority" SET DEFAULT 'sedang'::"public"."report_priority";--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "priority" SET DATA TYPE "public"."report_priority" USING "priority"::"public"."report_priority";