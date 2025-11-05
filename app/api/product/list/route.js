import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find().sort({ date: -1 });

    if (!products.length) {
      return NextResponse.json({
        success: false,
        message: "No products found.",
        products: [],
      });
    }

    return NextResponse.json({
      success: true,
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Error fetching products",
    });
  }
}
