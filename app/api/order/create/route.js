import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    await connectDB();

    const { userId } = getAuth(req);
    const body = await req.json();
    const { cartItems, totalAmount, address } = body;

    // 🧠 Authentication check
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated" },
        { status: 401 }
      );
    }

    // 🛒 Cart validation
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Cart is empty or invalid" },
        { status: 400 }
      );
    }

    // 🧾 Build items array with product info from DB
    const items = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);

          if (!product) {
            console.warn(`⚠️ Product not found: ${item.productId}`);
          }

          return {
            productId: product ? product._id : item.productId,
            name: product ? product.name : item.name || "Unknown Product",
            price: product ? product.price : item.price || 0,
            qty: item.quantity || 1,
            total:
              (product ? product.price : item.price || 0) *
              (item.quantity || 1),
          };
        } catch (err) {
          console.error("⚠️ Product fetch error:", err.message);
          return {
            productId: item.productId,
            name: item.name || "Unknown Product",
            price: item.price || 0,
            qty: item.quantity || 1,
            total: (item.price || 0) * (item.quantity || 1),
          };
        }
      })
    );

    // ✅ Clean address data
    const cleanAddress = {
      fullName: address?.fullName || "Unknown",
      area: address?.area || "—",
      city: address?.city || "—",
      state: address?.state || "—",
      phoneNumber: address?.phoneNumber || "—",
      postalCode: address?.postalCode || "—",
    };

    // 🛍️ Create new order
    const order = new Order({
      userId,
      items,
      totalAmount: totalAmount || 0,
      address: cleanAddress,
      status: "pending",
      paymentMethod: "COD",
    });

    await order.save();

    console.log("✅ Order saved successfully:", order._id);

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
