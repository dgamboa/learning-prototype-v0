# New Table Instructions

Follow these instructions to create a new table in the database.

## Guidelines

- User IDs should be formated like this, `userId: text("user_id").notNull()`, becuase we use Cleck for auth.
- Use the `createdAt` and `updatedAt` columns for timestamps.

## Step 1: Create the Schema
This is an example of how to create a new table in the database.

This file should be named like `users-schema.ts`.

This file should go in the `db/schema` folder.

Make sure to export the `users-schema.ts` file in the `db/schema/index.ts` file.

Make sure to add the table to the schema object in the `db/db.ts` file.

```typescript
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
```

## Step 2: Create the Queries
This is an example of how to create the queres for the table.

This file should be named like `users-queries.ts`.

This file should go in the `db/queries` folder.

```typescript
import { eq } from "drizzle-orm";
import { db } from "../db";
import { InsertUser, usersTable, SelectUser } from "../schema/users-schema";

export const createUser = async (data: InsertUser) => {
  try {
    const [newUser] = await db.insert(usersTable).values(data).returning();
    return newUser;
  } catch (error) {
    console.error("Error creating user: ", error);
    throw new Error("Failed to create user");
  }
};

export const getUserByUserId = async (userId: string) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(usersTable.userId, userId)
    });

    return user;
  } catch (error) {
    console.error("Error getting user by user ID:", error);
    throw new Error("Failed to get user");
  }
};

export const getAllUsers = async (): Promise<SelectUser[]> => {
  return db.query.users.findMany();
};

export const updateUser = async (userId: string, data: Partial<InsertUser>) => {
  try {
    const [updatedUser] = await db.update(usersTable).set(data).where(eq(usersTable.userId, userId)).returning();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

export const updateUserByStripeCustomerId = async (stripeCustomerId: string, data: Partial<InsertUser>) => {
  try {
    const [updatedUser] = await db.update(usersTable).set(data).where(eq(usersTable.stripeCustomerId, stripeCustomerId)).returning();
    return updatedUser;
  } catch (error) {
    console.error("Error updating user by stripe customer ID:", error);
    throw new Error("Failed to update user");
  }
};

export const deleteUser = async (userId: string) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.userId, userId));
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};
```

## Step 3: Create the Actions
This is an example of how to create the actions for the table.

This file should be named like `users-actions.ts`.

```typescript
"use server";

import { createUser, deleteUser, getAllUsers, getUserByUserId, updateUser } from "@/db/queries/users-queries";
import { InsertUser } from "@/db/schema/users-schema";
import { ActionState } from "@/types";
import console from "console";
import { revalidatePath } from "next/cache";

export async function createUserAction(data: InsertUser): Promise<ActionState> {
  try {
    const newUser = await createUser(data);
    console.log("New user created", newUser);
    revalidatePath("/");
    return { status: "success", message: "User created successfully", data: newUser };
  } catch (error) {
    return { status: "error", message: "Error creating user" };
  }
}

export async function getUserByUserIdAction(userId: string): Promise<ActionState> {
  try {
    const user = await getUserByUserId(userId);
    if (!user) {
      return { status: "error", message: "User not found" };
    }
    return { status: "success", message: "User retrieved successfully", data: user };
  } catch (error) {
    return { status: "error", message: "Failed to get user" };
  }
}

export async function getAllUsersAction(): Promise<ActionState> {
  try {
    const users = await getAllUsers();
    return { status: "success", message: "Users retrieved successfully", data: users };
  } catch (error) {
    return { status: "error", message: "Failed to get users" };
  }
}

export async function updateUserAction(userId: string, data: Partial<InsertUser>): Promise<ActionState> {
  try {
    const updatedUser = await updateUser(userId, data);
    revalidatePath("/users");
    return { status: "success", message: "User updated successfully", data: updatedUser };
  } catch (error) {
    return { status: "error", message: "Failed to update user" };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionState> {
  try {
    await deleteUser(userId);
    revalidatePath("/users");
    return { status: "success", message: "User deleted successfully" };
  } catch (error) {
    return { status: "error", message: "Failed to delete user" };
  }
}
```

## Step 4: Generate the SQL File and Migrate the Database

```bash
npm run db:generate
npm run db:migrate
```