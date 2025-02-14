import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserByUserIdAction } from "@/actions/users-actions";

export default async function PlaceholderPage() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/login");
  }

  const {data} = await getUserByUserIdAction(userId);

  if (!data) {
    return redirect("/signup");
  }

  if (data.membership === "free") {
    return redirect("/pricing");
  }

  return <div>Placeholder</div>;
}
