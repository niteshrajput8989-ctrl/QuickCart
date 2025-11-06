import connectDB from "@/config/db";
import User from "@/models/User";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(userId);

    if (!user) {
      // return an empty user structure if no doc exists
      return NextResponse.json({ success: true, user: { cartItems: {} } });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User data GET error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
