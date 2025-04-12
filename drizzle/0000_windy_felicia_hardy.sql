CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100),
	"email" varchar(255),
	"wallet_address" varchar(255),
	"phone_number" varchar(10),
	"profile_image_url" varchar(512),
	"location" varchar(100),
	"bio" varchar(500),
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"auth_method" varchar(50) DEFAULT 'email',
	"role" varchar(50) DEFAULT 'user',
	"is_verified" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_wallet_address_unique" UNIQUE("wallet_address")
);
