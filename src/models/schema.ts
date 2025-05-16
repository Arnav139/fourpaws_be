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
  primaryKey,
  date,
} from "drizzle-orm/pg-core";

// Users table
export const users: any = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }),
    email: varchar("email", { length: 255 }).unique(),
    walletAddress: varchar("wallet_address", { length: 255 }).unique(),
    phoneNumber: varchar("phone_number").unique(),
    profileImageUrl: varchar("profile_image_url", { length: 512 }),
    location: varchar("location", { length: 100 }),
    bio: varchar("bio"),
    joinedAt: timestamp("joined_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    authMethod: varchar("auth_method", { length: 50 }).default("email"),
    role: varchar("role").default("user"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: integer("follower_id").references(() => users.id),
    followingId: integer("following_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

// pet
export const pets: any = pgTable(
  "pets",
  {
    id: serial("id").unique(),
    ownerId: integer("owner_id").references(() => users.id),
    registrationNumber: varchar("registration_number", { length: 100 }),
    governmentRegistered: boolean("government_registered")
      .default(false)
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    guardianName: varchar("guardian_name", { length: 100 }),
    species: varchar("species").notNull(),
    breed: varchar("breed").notNull(),
    gender: varchar("gender").default("unknown"),
    sterilized: boolean("sterilized").default(false),
    bio: varchar("bio", { length: 1000 }),
    image: varchar("image").notNull(),
    additionalImages: jsonb("additional_images").$type<string[]>(),
    dateOfBirth: date("date_of_birth"),
    metaData: jsonb("metaData").$type<object>(),
    personalityTraits: jsonb("personalityTraits").$type<string[]>(),
    allergies: jsonb("allergies").$type<string[]>(),
    medications: jsonb("medications").$type<string[]>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    documents: jsonb("documents").$type<{
      veterinaryHealthCard: string;
      vaccinationCard: string;
      passport: string;
      imageWithOwner: string;
      ownerIdProof: string;
      sterilizationCard: string;
    }>(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const vaccination = pgTable(
  "vaccination_data",
  {
    id: serial("id").unique(),
    petId: integer("pet_id").references(() => pets.id),
    vetName: varchar("vetname"),
    clinic: varchar("clinic"),
    description: varchar("description"),
    vaccineName: varchar("vaccineName"),
    vaccineType: varchar("vaccineType"),
    documentUrl: varchar("document_url"),
    batchNumber: varchar("batch_number"),
    nextAppointmentDate: timestamp("next_Appointment_Date", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const healthcheckup = pgTable(
  "health_checkup",
  {
    id: serial("id").unique(),
    petId: integer("pet_id").references(() => pets.id),
    checkupType: varchar("checkup_type"),
    title: varchar("title"),
    description: varchar("description"),
    vetName: varchar("vetName"),
    clinic: varchar("clinic"),
    medications: jsonb("medications").$type<string[]>(),
    notes: varchar("notes"),
    nextAppointmentDate: timestamp("nextAppointmentDate", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    authorId: integer("author_id").references(() => users.id),
    content: text("content").notNull(),
    media: jsonb("media").$type<{id:string, type:string, url:string}[]>(),
    type: varchar("type").default("standard"),
    metadata: jsonb("metadata").$type<object>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const collectibles = pgTable(
  "collectibles",
  {
    id: serial("id").primaryKey(),
    owner: integer("owner").references(() => users.id),
    name: text("name").notNull(),
    description: text("description"),
    image: varchar("image_url"),
    price: integer("price").notNull(),
    rarity: varchar("rarity").default("common"),
    category: varchar("category").notNull(),
    count: integer("count").default(10),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

// Comments table
export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    content: text("content").notNull(),
    postId: integer("post_id").references(() => posts.id),
    authorId: integer("author_id").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

// Likes table
export const postLikes = pgTable(
  "post_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").references(() => posts.id),
    userId: integer("user_id").references(() => users.id),
    commentId: integer("comment_id").references(() => comments.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

// User's collectibles (junction table for many-to-many relationship)
export const userCollectibles = pgTable(
  "user_collectibles",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    collectibleId: integer("collectible_id").references(() => collectibles.id),
    petId: integer("pet_id").references(() => pets.id),
    acquiredAt: timestamp("acquired_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    {
      pk: primaryKey({ columns: [table.id] }),
    },
  ],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    images: jsonb("images").$type<string[]>(),
    price: integer("price").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("INR"),
    stockCount: integer("stock_count").notNull().default(0),
    metadata: jsonb("metadata").$type<object>(),
    discount: integer("discount").default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [{ pk: primaryKey({ columns: [table.id] }) }]
);

// --- Order Status Enum ---
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

// --- Order Table ---
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    totalAmount: integer("total_amount").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    cashfreeOrderId: varchar("cashfree_order_id", { length: 100 }).notNull(),
    paymentSessionId: varchar("payment_session_id", { length: 100 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [{ pk: primaryKey({ columns: [table.id] }) }]
);

// --- Order Items Table ---
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id),
    productId: integer("product_id").references(() => products.id),
    quantity: integer("quantity").notNull().default(1),
    price: integer("price").notNull(), // unit price at time of order
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [{ pk: primaryKey({ columns: [table.id] }) }]
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  pets: many(pets),
  posts: many(posts),
  comments: many(comments),
  postLikes: many(postLikes),
  collectibles: many(collectibles),
  userCollectibles: many(userCollectibles), // Add this line
  followers: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "followers",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(users, {
    fields: [pets.ownerId],
    references: [users.id],
  }),
  vaccination: many(vaccination),
  medical: many(healthcheckup),
  // posts: many(posts)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(postLikes),
}));

export const collectiblesRelations = relations(
  collectibles,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [collectibles.owner],
      references: [users.id],
    }),
    buyer: many(userCollectibles),
  }),
);

// Add collectibles relations
export const userCollectiblesRelations = relations(
  userCollectibles,
  ({ one }) => ({
    user: one(users, {
      fields: [userCollectibles.userId],
      references: [users.id],
    }),
    collectible: one(collectibles, {
      fields: [userCollectibles.collectibleId],
      references: [collectibles.id],
    }),
    pet: one(pets, {
      fields: [userCollectibles.petId],
      references: [pets.id],
    }),
  }),
);

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references:  [users.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(posts, {
    fields: [postLikes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const vaccinationRelations = relations(vaccination, ({ one }) => ({
  pet: one(pets, {
    fields: [vaccination.petId],
    references: [pets.id],
  }),
}));

export const heathcheckupRealations = relations(healthcheckup, ({ one }) => ({
  pet: one(pets, {
    fields: [healthcheckup.petId],
    references: [pets.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));