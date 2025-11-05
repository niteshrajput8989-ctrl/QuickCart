import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export default async function authSeller(userId) {
  try {
    console.log("🧾 Checking seller authorization for user:", userId);
    console.log("🧠 clerkClient:", !!clerkClient);
    console.log("🧠 typeof clerkClient.users.getUser:", typeof clerkClient?.users?.getUser);
    console.log("🔑 CLERK_SECRET_KEY present?:", !!process.env.CLERK_SECRET_KEY);

    const user = await clerkClient.users.getUser(userId);
    console.log("🔍 Clerk user publicMetadata:", user?.publicMetadata);

    if (!user) throw new Error("User not found in Clerk");

    const isSeller =
      user?.publicMetadata?.isSeller === true ||
      user?.publicMetadata?.role === "seller";

    console.log("✅ Seller status:", isSeller);

    if (!isSeller) throw new Error("User not authorized as seller");
    return true;
  } catch (error) {
    console.error("❌ Error in authSeller():", error.message);
    return false;
  }
}
