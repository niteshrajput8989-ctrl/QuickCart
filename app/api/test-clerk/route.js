import { clerkClient } from "@clerk/nextjs/server";

export async function GET() {
  try {
    console.log("🧠 clerkClient:", !!clerkClient);
    console.log("🧠 typeof clerkClient?.users?.getUser:", typeof clerkClient?.users?.getUser);
    console.log("🧠 CLERK_SECRET_KEY present?:", !!process.env.CLERK_SECRET_KEY);

    const test = typeof clerkClient?.users?.getUser;
    return Response.json({
      status: "ok",
      clerkClientLoaded: !!clerkClient,
      getUserType: test,
      hasSecret: !!process.env.CLERK_SECRET_KEY,
    });
  } catch (e) {
    return Response.json({ error: e.message });
  }
}
