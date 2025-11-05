"use client";
import React, { useState } from "react";
import ProductCard from "./ProductCard";
import { productsDummyData } from "@/assets/assets";

const ProductList = () => {
  const [visibleCount, setVisibleCount] = useState(8); // show 8 initially
  const products = productsDummyData;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8); // show 8 more
  };

  return (
    <div className="p-4 md:p-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.slice(0, visibleCount).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {visibleCount < products.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 border border-gray-300 rounded-full text-sm hover:bg-gray-100 transition"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
