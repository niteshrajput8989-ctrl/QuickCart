import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { productId, name, price, image, quantity } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: "Product ID missing" }, { status: 400 });
    }

    await connectDB();

    // Clerk userId se find karo
    let user = await User.findOne({ clerkId: userId });
    if (!user) {
      user = await User.create({ clerkId: userId, cartItems: [] });
    }

    // ✅ Add or Update item
    const existingItem = user.cartItems.find(
      (item) => String(item.productId) === String(productId)
    );

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      user.cartItems.push({ productId, name, price, image, quantity });
    }

    await user.save();

    return NextResponse.json({ success: true, message: "Cart updated", cart: user.cartItems });
  } catch (error) {
    console.error("Cart update error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
