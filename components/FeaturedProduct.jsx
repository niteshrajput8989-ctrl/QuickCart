"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link"; // ✅ add this
import { assets, productsDummyData } from "@/assets/assets";

const FeaturedProduct = () => {
  const products = productsDummyData;

  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Featured Products</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map((product, index) => {
          const imageSrc =
            typeof product.image === "string" && product.image.trim() !== ""
              ? product.image
              : "/placeholder.png"; // fallback image

          return (
            <div key={index} className="relative group">
              {/* ✅ Make product image clickable */}
              <Link href={`/product/${product.id || index}`} className="block">
                <Image
                  src={imageSrc}
                  alt={product.name || "Product Image"}
                  className="group-hover:brightness-75 transition duration-300 w-full h-auto object-cover"
                  width={400}
                  height={400}
                />
              </Link>

              <div className="group-hover:-translate-y-4 transition duration-300 absolute bottom-8 left-8 text-white space-y-2">
                <p className="font-medium text-xl lg:text-2xl">
                  {product.name}
                </p>
                <p className="text-sm lg:text-base leading-5 max-w-60">
                  {product.description || "High-quality and reliable product"}
                </p>

                {/* ✅ Buy Now button also clickable */}
                <Link href={`/product/${product.id || index}`}>
                  <button className="flex items-center gap-1.5 bg-orange-600 px-4 py-2 rounded">
                    Buy now{" "}
                    <Image
                      src={assets.redirect_icon}
                      alt="Redirect Icon"
                      width={16}
                      height={16}
                      className="h-3 w-3"
                    />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FeaturedProduct;
