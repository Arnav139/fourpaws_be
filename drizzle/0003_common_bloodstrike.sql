CREATE TABLE "health_checkup" (
	"id" serial NOT NULL,
	"pet_id" integer,
	"checkup_type" varchar,
	"title" varchar,
	"description" varchar,
	"vetName" varchar,
	"clinic" varchar,
	"medications" jsonb,
	"notes" varchar,
	"nextAppointmentDate" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "health_checkup_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "heath_checkup" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "heath_checkup" CASCADE;--> statement-breakpoint
ALTER TABLE "pets" DROP CONSTRAINT "pets_registration_number_unique";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_unique";--> statement-breakpoint
ALTER TABLE "posts" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "breed" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "gender" varchar DEFAULT 'unknown';--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "sterilized" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "bio" varchar(1000);--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "image" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "additional_images" jsonb;--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "medications" jsonb;--> statement-breakpoint
ALTER TABLE "pets" ADD COLUMN "documents" jsonb;--> statement-breakpoint
ALTER TABLE "vaccination_data" ADD COLUMN "next_Appointment_Date" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "health_checkup" ADD CONSTRAINT "health_checkup_pet_id_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets" DROP COLUMN "varchar";--> statement-breakpoint
ALTER TABLE "pets" DROP COLUMN "Image";