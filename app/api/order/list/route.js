import connectDB from "@/config/db";
import Order from "@/models/Order";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No userId found" },
        { status: 401 }
      );
    }

    await connectDB();

    // ✅ Populate product details
    const orders = await Order.find({ userId })
      .populate({
        path: "items.productId",
        select: "name price image",
      })
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { success: true, orders: orders || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return NextResponse.json(
      { success: false, message: error.message, orders: [] },
      { status: 500 }
    );
  }
}
