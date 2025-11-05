"use client";

import React from "react";
import ProductCard from "./ProductCard";
import { productsDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";

const HomeProducts = () => {
  const router = useRouter();

  // Sirf 8 products homepage par
  const products = productsDummyData.slice(0, 8);

  return (
    <div className="flex flex-col items-center pt-14">
      <p className="text-2xl font-medium text-left w-full px-4 md:px-10">
        Popular Products
      </p>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full px-4 md:px-10">
        {products.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
      </div>

      {/* See more button */}
      <button
        onClick={() => router.push("/all-products")}
        className="px-12 py-2.5 border rounded text-gray-500/70 hover:bg-slate-50/90 transition"
      >
        See more
      </button>
    </div>
  );
};

export default HomeProducts;
