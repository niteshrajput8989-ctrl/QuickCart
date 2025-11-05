"use client";

import React from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";

const ProductCard = ({ product }) => {
  const { currency, router } = useAppContext();

  if (!product) return null;

  const productId = product?._id || product?.id;

  const handleProductClick = () => {
    if (!productId) return;
    router.push(`/product/${productId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ FIXED: Support both 'images' and 'image' fields
  const imageSrc =
    (Array.isArray(product.images) && product.images.length > 0 && product.images[0]) ||
    (Array.isArray(product.image) && product.image.length > 0 && product.image[0]) ||
    assets.placeholder_img;

  return (
    <div
      onClick={handleProductClick}
      className="flex flex-col items-start gap-1 max-w-[200px] w-full cursor-pointer"
    >
      <div className="group relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden">
        <Image
          src={imageSrc}
          alt={product.name || "Product image"}
          width={800}
          height={800}
          className="object-cover w-4/5 h-4/5 md:w-full md:h-full group-hover:scale-105 transition-transform duration-300"
          priority={false}
          onError={(e) => (e.currentTarget.src = assets.placeholder_img)}
        />
      </div>

      <p className="font-medium pt-2 w-full truncate">
        {product.name || "Unnamed Product"}
      </p>

      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {product.description || "No description available."}
      </p>

      <div className="flex items-center gap-2">
        <p className="text-xs">{product.rating || "4.5"}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Image
              key={i}
              src={
                i < Math.floor(product.rating || 4)
                  ? assets.star_icon
                  : assets.star_dull_icon
              }
              alt="star"
              width={12}
              height={12}
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-medium">
          {currency}
          {product.offerPrice || product.price || 0}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
