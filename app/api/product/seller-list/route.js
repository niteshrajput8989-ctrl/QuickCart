import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/lib/authSeller";

export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId)
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });

    const isSeller = await authSeller(userId);
    if (!isSeller)
      return NextResponse.json({
        success: false,
        message: "User not authorized as seller",
      });

    await connectDB();

    const products = await Product.find({ userId }).sort({ date: -1 });

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching seller products:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Error fetching products",
    });
  }
}
