import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Address from "@/models/Address";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    // ✅ Clerk से userId लो
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // ✅ Request body parse करो
    const body = await req.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, message: "Address data is missing" },
        { status: 400 }
      );
    }

    // ✅ MongoDB से connect करो
    await connectDB();

    // ✅ नया address बनाओ
    const newAddress = await Address.create({
      ...address,
      userId, // Clerk userId के साथ
    });

    return NextResponse.json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("❌ Add Address API Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
