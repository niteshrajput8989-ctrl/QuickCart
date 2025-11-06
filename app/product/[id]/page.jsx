"use client";

import React, { useEffect, useState } from "react";
import { assets, productsDummyData } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";

const Product = () => {
  const { id } = useParams();
  const { products, router, addToCart } = useAppContext();

  const [productData, setProductData] = useState(null);
  const [mainView, setMainView] = useState(null);

  // ✅ Browser-only import for model-viewer
  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  // ✅ Product data find logic
  useEffect(() => {
    if (!id) return;

    const localProduct =
      products.find(
        (p) => String(p._id) === String(id) || String(p.id) === String(id)
      ) ||
      productsDummyData.find(
        (p) => String(p._id) === String(id) || String(p.id) === String(id)
      );

    if (localProduct) {
      setProductData(localProduct);
    } else {
      setProductData({
        name: "Fallback Product",
        description: "No product data found.",
        price: 499.99,
        offerPrice: 399.99,
        image: [assets.placeholder_img],
      });
    }
  }, [id, products]);

  // ✅ mainView set logic (image/model)
  useEffect(() => {
    if (productData) {
      const imgs = productData.image || [];
      if (imgs.length > 0) setMainView({ type: "image", src: imgs[0] });
      else if (productData.modelGlb || productData.modelUsdz)
        setMainView({ type: "model" });
    }
  }, [productData]);

  if (!productData || !mainView) return <Loading />;

  const imgs = productData.image || [];
  const hasModel = productData.modelGlb || productData.modelUsdz;

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* ---------- LEFT SIDE ---------- */}
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-100 mb-4 shadow-sm">
              {mainView.type === "image" ? (
                <Image
                  src={mainView.src}
                  alt={productData.name}
                  width={1280}
                  height={720}
                  className="w-full h-auto object-cover"
                />
              ) : (
                // ✅ 3D Model + AR view integrated
                <model-viewer
                  key={productData.modelGlb || productData.modelUsdz}
                  src={productData.modelGlb}
                  ios-src={productData.modelUsdz}
                  alt={productData.name}
                  ar
                  ar-modes="webxr scene-viewer quick-look"
                  camera-controls
                  auto-rotate
                  shadow-intensity="1"
                  exposure="1"
                  style={{
                    width: "100%",
                    height: "520px",
                    backgroundColor: "#f8f8f8",
                    borderRadius: "16px",
                  }}
                ></model-viewer>
              )}
            </div>

            {/* ---------- Thumbnails ---------- */}
            <div className="grid grid-cols-4 gap-4">
              {imgs.map((image, i) => (
                <button
                  key={i}
                  onClick={() => setMainView({ type: "image", src: image })}
                  className={`cursor-pointer rounded-lg overflow-hidden ring-1 transition ${
                    mainView.src === image
                      ? "ring-orange-500"
                      : "ring-transparent hover:ring-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${productData.name} ${i + 1}`}
                    width={320}
                    height={180}
                    className="w-full h-auto object-cover"
                  />
                </button>
              ))}

              {hasModel && (
                <button
                  onClick={() => setMainView({ type: "model" })}
                  className={`relative flex items-center justify-center h-[74px] md:h-[86px] rounded-lg bg-gray-50 border border-dashed transition hover:bg-gray-100 ${
                    mainView.type === "model"
                      ? "border-orange-500"
                      : "border-gray-300"
                  }`}
                >
                  <span className="text-sm text-gray-700">View in 3D</span>
                  <span className="absolute top-2 right-2 rounded bg-black/80 text-white text-[10px] px-1.5 py-0.5">
                    AR
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* ---------- RIGHT SIDE ---------- */}
          <div>
            <h1 className="text-3xl font-medium text-gray-800 mb-4">
              {productData.name}
            </h1>
            <p className="text-gray-600">{productData.description}</p>

            <p className="text-3xl font-medium mt-6">
              ${productData.offerPrice}
              <span className="text-base font-normal text-gray-500 line-through ml-2">
                ${productData.price}
              </span>
            </p>

            {/* ✅ Fixed Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => addToCart(productData)}
                className="w-full py-3.5 bg-gray-100 text-gray-800 hover:bg-gray-200 transition"
              >
                Add to Cart
              </button>

              <button
                onClick={() => {
                  addToCart(productData);
                  router.push("/cart");
                }}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {/* ---------- Featured Products ---------- */}
        <div className="mt-20">
          <h2 className="text-3xl font-semibold mb-6 text-center">
            Featured <span className="text-orange-500">Products</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {productsDummyData.slice(0, 5).map((p, i) => (
              <ProductCard key={i} product={p} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
