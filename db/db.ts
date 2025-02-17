import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { usersTable, chatsTable, messagesTable, sourcesTable } from "@/db/schema";

config({ path: ".env.local" });

const schema = {
  users: usersTable,
  chats: chatsTable,
  messages: messagesTable,
  sources: sourcesTable
};

const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });