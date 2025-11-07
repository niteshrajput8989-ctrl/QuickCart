import connectDB from "@/config/db";
import { NextResponse } from "next/server";
import User from "@/models/User";

export async function POST(req) {
  try {
    const { userId, cartItems } = await req.json();
    console.log("🛒 Updating cart for user:", userId);

    if (!userId || !cartItems) {
      return NextResponse.json(
        { success: false, message: "Missing userId or cartItems" },
        { status: 400 }
      );
    }

    await connectDB();

    // ✅ Pehle user check karo
    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      console.log("🆕 User not found — creating new one...");
      user = new User({
        clerkId: userId,
        name: "Guest User",
        email: `${userId}@example.com`,
        cartItems,
      });
      await user.save();
    } else {
      console.log("🛒 User found — updating cart...");
      // Direct update karo (save() ka version issue avoid karne ke liye)
      user = await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { cartItems } },
        { new: true }
      );
    }

    console.log("✅ Cart updated successfully");
    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      user,
    });
  } catch (error) {
    console.error("❌ Error updating cart:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
