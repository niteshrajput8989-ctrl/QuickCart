import connectDB from "@/config/db";
import User from "@/models/User";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId }).lean();
    const addresses = await Address.find({ userId }).lean();

    return NextResponse.json({
      success: true,
      user: {
        clerkId: userId,
        cartItems: user?.cartItems || [],
        addresses: addresses || [],
      },
    });
  } catch (error) {
    console.error("User data GET error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
