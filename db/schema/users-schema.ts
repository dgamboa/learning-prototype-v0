import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const membershipEnum = pgEnum("membership", ["free", "pro"]);

export const usersTable = pgTable("users", {
  userId: text("user_id").primaryKey().notNull(),
  email: text("email").notNull(),
  username: text("username").notNull().unique(),
  membership: membershipEnum("membership").default("free").notNull(),
  status: text({ enum: ["active", "inactive", "banned"] }).default("active").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
