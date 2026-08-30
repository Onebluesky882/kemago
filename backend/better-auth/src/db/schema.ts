import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Postgres mirror of packages/db/src/schema/auth.ts (same field names/shape,
// per the client's request to keep the Drizzle pattern already established
// there) — a separate schema because that one is D1/SQLite-only and D1
// only runs inside the Cloudflare Workers runtime, not a standalone Bun
// process (this service targets Railway). No `role` column (that's
// specific to the other app's owner/client/member model, not used here).
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),

  // Post-login "complete your profile" flag — no avatar field per
  // product rules (initials stand in for a photo). Set directly by the
  // mobile client via Better Auth's own update-user endpoint.
  profileComplete: boolean("profile_complete").notNull().default(false),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  // Better Auth 1.7.2's core account-creation path writes this on every
  // account row (credential included, not just OAuth) — missing it throws
  // "field issuer does not exist" on sign-up/email. Not present in
  // packages/db's mirror of this schema, which is pinned to an older
  // better-auth that predates the field.
  issuer: text("issuer"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
