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