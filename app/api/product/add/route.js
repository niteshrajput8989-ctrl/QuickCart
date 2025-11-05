import { v2 as cloudinary } from "cloudinary";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";
import User from "@/models/User";
import authSeller from "@/lib/authSeller"; // ✅ custom seller check

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ ADD PRODUCT (POST)
export async function POST(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    // ✅ Check seller authorization
    const isAuthorized = await authSeller(userId);
    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        message: "User not authorized as seller",
      });
    }

    // ✅ Connect MongoDB
    await connectDB();

    // ✅ Parse form data
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");
    const files = formData.getAll("images");

    if (!files?.length) {
      return NextResponse.json({
        success: false,
        message: "No image files uploaded",
      });
    }

    // ✅ Upload all images to Cloudinary
    const uploadResults = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(buffer);
        });
      })
    );

    const imageUrls = uploadResults.map((res) => res.secure_url);

    // ✅ Save product in DB
    const newProduct = await Product.create({
      userId,
      name,
      description,
      category,
      price: Number(price),
      offerPrice: Number(offerPrice),
      images: imageUrls,
      date: Date.now(),
    });

    console.log("🎉 Product added successfully:", newProduct._id);

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully!",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error uploading product:", error);
    return NextResponse.json({
      success: false,
      message: error.message || "Something went wrong",
    });
  }
}

// ✅ GET ALL PRODUCTS (GET)
export async function GET(request) {
  try {
    const { userId } = getAuth(request);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({
        success: false,
        message: "User not authorized as seller",
      });
    }

    await connectDB();
    const products = await Product.find({ userId });

    return NextResponse.json({
      success: true,
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
