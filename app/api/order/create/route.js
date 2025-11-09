import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Order from "@/models/Order";
import User from "@/models/User";
import Product from "@/models/Product";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, cartItems, totalAmount, address } = body;

    // 🧠 Safety check
    if (!cartItems || !Array.isArray(cartItems)) {
      console.error("❌ cartItems missing or invalid:", cartItems);
      return NextResponse.json(
        { success: false, message: "Invalid cart data" },
        { status: 400 }
      );
    }

    await connectDB();
    console.log("📦 Creating order for user:", userId);

    // ✅ Agar product DB me nahi milta, dummy data use karo
    const itemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          const product = await Product.findById(item.productId);

          if (!product) {
            console.log(
              "⚠️ Product not found in DB:",
              item.productId,
              "— using dummy data"
            );
            return {
              product: {
                _id: item.productId || "dummy-id",
                name: item.name || "Dummy Product",
                price: item.price || 999,
              },
              quantity: item.quantity || 1,
            };
          }

          return {
            product: {
              _id: product._id,
              name: product.name,
              price: product.price,
            },
            quantity: item.quantity,
          };
        } catch (err) {
          console.log("⚠️ Error loading product, using dummy:", err.message);
          return {
            product: {
              _id: item.productId || "dummy-id",
              name: item.name || "Dummy Product",
              price: item.price || 999,
            },
            quantity: item.quantity || 1,
          };
        }
      })
    );

    // ✅ Order create karna
    const newOrder = new Order({
      user: userId,
      items: itemsWithDetails,
      total: totalAmount || 0,
      address: address || "No address provided",
      status: "pending",
    });

    await newOrder.save();

    console.log("✅ Order saved successfully!");
    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
