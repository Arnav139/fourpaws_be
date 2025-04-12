import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";



// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }),
  email: varchar("email", { length: 255 }).unique(),
  walletAddress: varchar("wallet_address", { length: 255 }).unique(),
  phoneNumber: varchar("phone_number", { length: 10 }),
  profileImageUrl: varchar("profile_image_url", { length: 512 }),
  location: varchar("location", { length: 100 }),
  bio: varchar("bio", { length: 500 }),
  joinedAt: timestamp("joined_at", { withTimezone: true })
    .notNull()
  .defaultNow(),
  authMethod: varchar("auth_method", { length: 50 }).default("email"),
  role: varchar("role", { length: 50 }).default("user"),
  updatedAt : timestamp("updated_at", { withTimezone: true })
  .notNull()
.defaultNow(),
});
