"use server";

import { createUser, deleteUser, getAllUsers, getUserByUserId, updateUser } from "@/db/queries/users-queries";
import { InsertUser, SelectUser } from "@/db/schema/users-schema";
import { ActionState } from "@/types";
import console from "console";
import { revalidatePath } from "next/cache";

export async function createUserAction(data: InsertUser): Promise<ActionState<InsertUser>> {
  try {
    const newUser = await createUser(data);
    console.log("New user created", newUser);
    revalidatePath("/");
    return { isSuccess: true, message: "User created successfully", data: newUser };
  } catch (error) {
    return { isSuccess: false, message: "Error creating user" };
  }
}

export async function getUserByUserIdAction(userId: string): Promise<ActionState<SelectUser>> {
  try {
    const user = await getUserByUserId(userId);
    if (!user) {
      return { isSuccess: false, message: "User not found" };
    }
    return { isSuccess: true, message: "User retrieved successfully", data: user };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get user" };
  }
}

export async function getAllUsersAction(): Promise<ActionState<SelectUser[]>> {
  try {
    const users = await getAllUsers();
    return { isSuccess: true, message: "Users retrieved successfully", data: users };
  } catch (error) {
    return { isSuccess: false, message: "Failed to get users" };
  }
}

export async function updateUserAction(userId: string, data: Partial<InsertUser>): Promise<ActionState<SelectUser>> {
  try {
    const updatedUser = await updateUser(userId, data);
    revalidatePath("/users");
    return { isSuccess: true, message: "User updated successfully", data: updatedUser };
  } catch (error) {
    return { isSuccess: false, message: "Failed to update user" };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionState<SelectUser | undefined>> {
  try {
    await deleteUser(userId);
    revalidatePath("/users");
    return { isSuccess: true, message: "User deleted successfully" };
  } catch (error) {
    return { isSuccess: false, message: "Failed to delete user" };
  }
}