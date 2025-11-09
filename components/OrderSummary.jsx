"use client";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const OrderSummary = () => {
  const {
    currency,
    router,
    getCartCount,
    cartItems,
    getToken,
    setCartItems,
    user,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  // ✅ Total Calculation
  const getTotal = () => {
    let total = 0;
    Object.values(cartItems || {}).forEach((item) => {
      if (!item || typeof item !== "object") return;
      const price = Number(
        item?.offerPrice !== undefined && item?.offerPrice !== null
          ? item.offerPrice
          : item?.price || 0
      );
      const qty = Number(item?.quantity || 1);
      total += price * qty;
    });
    return total.toFixed(2);
  };

  const subtotal = parseFloat(getTotal());
  const tax = (subtotal * 0.02).toFixed(2);
  const discountAmount = (subtotal * discount).toFixed(2);
  const total = (subtotal + parseFloat(tax) - discountAmount).toFixed(2);

  // ✅ Fetch user addresses
  const fetchUserAddresses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) return;

      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        const addresses = data.user?.addresses || [];
        setUserAddresses(addresses);
        setSelectedAddress(addresses[0] || null);
      } else {
        setUserAddresses([]);
      }
    } catch (err) {
      console.error("❌ Failed to fetch addresses:", err);
      setUserAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, [user]);

  // ✅ Promo Code
  const handlePromoApply = () => {
    if (promo.toLowerCase() === "save10") {
      setDiscount(0.1);
      toast.success("Promo code applied (10% off)");
    } else {
      toast.error("Invalid promo code");
      setDiscount(0);
    }
  };

  // ✅ Place Order Function
  const createOrder = async () => {
    try {
      if (!selectedAddress?._id) return toast.error("Please select an address");

      const token = await getToken();
      if (!token) return toast.error("Please login first");

      // 🧩 Convert cartItems to array for API
      const itemsArray = Object.values(cartItems || {}).map((item) => ({
        product: item._id, // ✅ FIXED: Correct key expected by backend
        quantity: item.quantity || 1,
      }));

      if (itemsArray.length === 0) return toast.error("Your cart is empty");

      setPlacingOrder(true);

      const res = await fetch("/api/order/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?._id || "guest",
          cartItems: itemsArray,
          totalAmount: total,
          address: selectedAddress._id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Order placed successfully!");
        setCartItems({});
        router.push("/order-placed");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("❌ Order creation failed:", error);
      toast.error("Something went wrong while placing order");
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="w-full md:w-96 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>
      <hr className="border-gray-300 mb-5" />

      {/* Address Dropdown */}
      <div className="mb-6 relative">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Select Address
        </label>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full border rounded-md bg-gray-50 hover:bg-gray-100 px-4 py-2 text-left text-gray-700 focus:outline-none"
        >
          {loading
            ? "Loading..."
            : selectedAddress
            ? `${selectedAddress.fullName}, ${selectedAddress.city}`
            : "Select Address"}
          <span className="float-right text-gray-500">▼</span>
        </button>

        {isDropdownOpen && (
          <ul className="absolute bg-white w-full border shadow-md rounded-md mt-1 z-10 max-h-60 overflow-y-auto">
            {userAddresses.length > 0 ? (
              userAddresses.map((address, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setSelectedAddress(address);
                    setIsDropdownOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                >
                  {address.fullName}, {address.city}, {address.state}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No addresses found</li>
            )}
            <li
              onClick={() => router.push("/add-address")}
              className="px-4 py-2 text-center text-orange-600 font-medium hover:bg-gray-100 cursor-pointer"
            >
              + Add New Address
            </li>
          </ul>
        )}
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Promo Code
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Enter promo code"
            className="flex-grow border rounded-md px-3 py-2 outline-none"
          />
          <button
            onClick={handlePromoApply}
            className="bg-orange-600 text-white px-5 py-2 rounded-md hover:bg-orange-700 transition"
          >
            Apply
          </button>
        </div>
      </div>

      <hr className="border-gray-300 mb-5" />

      {/* Summary */}
      <div className="space-y-3 text-gray-700 text-sm">
        <div className="flex justify-between">
          <p>Items ({getCartCount()})</p>
          <p>
            {currency}
            {subtotal}
          </p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p className="text-green-600 font-medium">Free</p>
        </div>
        <div className="flex justify-between">
          <p>Tax (2%)</p>
          <p>
            {currency}
            {tax}
          </p>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <p>Discount ({discount * 100}%)</p>
            <p>
              -{currency}
              {discountAmount}
            </p>
          </div>
        )}
        <div className="flex justify-between text-base md:text-lg font-semibold border-t pt-3 mt-3">
          <p>Total</p>
          <p>
            {currency}
            {total}
          </p>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={placingOrder}
        className={`w-full text-white py-3 mt-6 rounded-md transition font-medium ${
          placingOrder
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-orange-600 hover:bg-orange-700"
        }`}
      >
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderSummary;
