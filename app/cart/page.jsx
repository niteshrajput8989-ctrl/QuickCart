"use client";
import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import OrderSummary from "@/components/OrderSummary";
import { useAppContext } from "@/context/AppContext";

const Cart = () => {
  const {
    products,
    router,
    cartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    removeFromCart,
  } = useAppContext();

  // Agar cartItems object me product data hai (id nahi)
  const productIds = Object.keys(cartItems || {});
  const totalCount = getCartCount();

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        {/* LEFT SIDE - CART ITEMS */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Your <span className="font-medium text-orange-600">Cart</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">
              {totalCount} {totalCount === 1 ? "Item" : "Items"}
            </p>
          </div>

          {productIds.length === 0 ? (
            <p className="text-center text-gray-500 py-10">🛍️ Your cart is empty</p>
          ) : (
            <table className="min-w-full table-auto">
              <thead>
                <tr>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Product</th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Price</th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Quantity</th>
                  <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {productIds.map((id) => {
                  const item = cartItems[id]; // <-- ye full object hai
                  if (!item) return null;

                  const name = item.name || "Product";
                  const price = item.offerPrice || item.price || 0;
                  const qty = item.quantity || 1;
                  const img = item.image?.[0] || "/placeholder.jpg";

                  return (
                    <tr key={id} className="border-b border-gray-200">
                      <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                        <div className="rounded-lg overflow-hidden bg-gray-100 p-2">
                          <Image
                            src={img}
                            alt={name}
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{name}</p>
                          <button
                            className="text-xs text-orange-600 mt-1"
                            onClick={() => removeFromCart(id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>

                      <td className="py-4 md:px-4 px-1 text-gray-600">₹{price}</td>

                      <td className="py-4 md:px-4 px-1">
                        <div className="flex items-center md:gap-2 gap-1">
                          <button
                            onClick={() => updateCartQuantity(id, Math.max(qty - 1, 1))}
                            className="px-2 py-1 border rounded"
                          >
                            -
                          </button>
                          <input
                            onChange={(e) =>
                              updateCartQuantity(id, Math.max(Number(e.target.value), 1))
                            }
                            type="number"
                            value={qty}
                            className="w-14 border text-center rounded"
                          />
                          <button
                            onClick={() => updateCartQuantity(id, qty + 1)}
                            className="px-2 py-1 border rounded"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td className="py-4 md:px-4 px-1 text-gray-600">
                        ₹{(price * qty).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <button
            onClick={() => router.push("/all-products")}
            className="group flex items-center mt-6 gap-2 text-orange-600"
          >
            Continue Shopping
          </button>
        </div>

        {/* RIGHT SIDE - ORDER SUMMARY */}
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;
