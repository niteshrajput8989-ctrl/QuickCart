import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(req, context) {
  try {
    await connectDB();

    // ✅ Fix: In Next.js App Router, `params` must be awaited
    const { params } = await context;
    const id = params?.id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "No ID provided" },
        { status: 400 }
      );
    }

    // ✅ Fetch product from MongoDB
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    // ✅ Always send as { success, data }
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching product" },
      { status: 500 }
    );
  }
}
