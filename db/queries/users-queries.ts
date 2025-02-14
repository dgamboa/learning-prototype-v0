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