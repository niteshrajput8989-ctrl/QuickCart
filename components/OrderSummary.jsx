"use client";
import { addressDummyData } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, cartItems, getToken } = useAppContext();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  // 🏠 Fetch dummy addresses (later connect with API)
  const fetchUserAddresses = async () => {
    setUserAddresses(addressDummyData);
  };

  // ✅ Select Address
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  // 🏷️ Apply Promo Code
  const handlePromoApply = () => {
    if (promo.trim().toLowerCase() === "save10") {
      setDiscount(0.1);
      toast.success("Promo applied: 10% off");
    } else {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  // 🛒 Create Order
  const createOrder = async () => {
    if (!selectedAddress) return toast.error("Please select address");

    const orderData = {
      items: Object.values(cartItems),
      subtotal: getCartAmount(),
      discountPercent: discount * 100,
      tax: Math.floor(getCartAmount() * 0.02),
      total: Math.floor(getCartAmount() * (1 + 0.02 - discount)),
      address: selectedAddress,
      date: new Date().toISOString(),
    };

    try {
      const token = await getToken();
      await axios.post("/api/order/create", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err) {
      console.error(err);
      toast.error("Order creation failed!");
    }
  };

  useEffect(() => {
    fetchUserAddresses();
  }, []);

  // 💰 Calculations
  const subtotal = getCartAmount();
  const tax = Math.floor(subtotal * 0.02);
  const discountAmount = Math.floor(subtotal * discount);
  const total = subtotal + tax - discountAmount;

  return (
    <div className="w-full md:w-96 bg-gray-50 p-5 rounded-2xl shadow">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">
        Order Summary
      </h2>
      <hr className="border-gray-300 mb-5" />

      {/* Address Section */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Select Address
        </label>
        <div className="relative border rounded-md overflow-hidden">
          <button
            className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>
              {selectedAddress
                ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
                : "Select Address"}
            </span>
            <svg
              className={`w-5 h-5 inline float-right transition-transform duration-200 ${
                isDropdownOpen ? "rotate-0" : "-rotate-90"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#6B7280"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-56 overflow-y-auto">
              {userAddresses.map((address, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                  onClick={() => handleAddressSelect(address)}
                >
                  {address.fullName}, {address.area}, {address.city}
                </li>
              ))}
              <li
                onClick={() => router.push("/add-address")}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center text-orange-600 font-medium"
              >
                + Add New Address
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Promo Code */}
      <div className="mb-6">
        <label className="text-sm font-semibold text-gray-600 block mb-2">
          Promo Code
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Enter promo code"
            className="flex-grow outline-none p-2.5 text-gray-600 border rounded-md"
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

      {/* Price Details */}
      <div className="space-y-3 text-gray-700 text-sm">
        <div className="flex justify-between">
          <p>Items ({getCartCount()})</p>
          <p>{currency}{subtotal}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p className="text-green-600 font-medium">Free</p>
        </div>
        <div className="flex justify-between">
          <p>Tax (2%)</p>
          <p>{currency}{tax}</p>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600 font-medium">
            <p>Discount ({discount * 100}%)</p>
            <p>-{currency}{discountAmount}</p>
          </div>
        )}
        <div className="flex justify-between text-base md:text-lg font-semibold border-t pt-3 mt-3">
          <p>Total</p>
          <p>{currency}{total}</p>
        </div>
      </div>

      {/* Place Order */}
      <button
        onClick={createOrder}
        className="w-full bg-orange-600 text-white py-3 mt-6 rounded-md hover:bg-orange-700 transition font-medium"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
