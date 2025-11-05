"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";

const ProductList = () => {
  const { router, getToken, user } = useAppContext();

  // ✅ Initialize safe states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch seller products
  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();

      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Always ensure products is an array
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]); // fallback
        toast.error(data.message || "No products found.");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error(error.message || "Failed to fetch products.");
      setProducts([]); // prevent crash
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch data only when user is available
  useEffect(() => {
    const loadProducts = async () => {
      await fetchSellerProduct();
    };
    loadProducts();
  }, []);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-10 p-4">
          <h2 className="pb-4 text-lg font-medium">All Products</h2>

          <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
            <table className="table-fixed w-full overflow-hidden">
              <thead className="text-gray-900 text-sm text-left">
                <tr>
                  <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">
                    Product
                  </th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Category
                  </th>
                  <th className="px-4 py-3 font-medium truncate">Price</th>
                  <th className="px-4 py-3 font-medium truncate max-sm:hidden">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="text-sm text-gray-500">
                {Array.isArray(products) && products.length > 0 ? (
                  products.map((product, index) => (
                    <tr
                      key={product._id || index}
                      className="border-t border-gray-500/20"
                    >
                      <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                        <div className="bg-gray-500/10 rounded p-2">
                          <Image
                            src={
                              product.images && product.images.length > 0
                                ? product.images[0]
                                : assets.placeholder_img
                            }
                            alt={product.name || "Product"}
                            className="w-16 h-16 object-cover rounded"
                            width={64}
                            height={64}
                          />
                        </div>
                        <span className="truncate w-full">
                          {product.name || "Untitled"}
                        </span>
                      </td>
                      <td className="px-4 py-3 max-sm:hidden">
                        {product.category || "—"}
                      </td>
                      <td className="px-4 py-3">
                        ${product.offerPrice ?? "N/A"}
                      </td>
                      <td className="px-4 py-3 max-sm:hidden">
                        <button
                          onClick={() => router.push(`/product/${product._id}`)}
                          className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded"
                        >
                          <span>Visit</span>
                          <img
                            src={
                              assets.redirect_icon.src ?? assets.redirect_icon
                            }
                            alt="redirect"
                            width="16"
                            height="16"
                          />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="text-center py-6 text-gray-400 italic"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;
