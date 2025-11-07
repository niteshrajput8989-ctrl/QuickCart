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
    getCartAmount,
    cartItems,
    getToken,
  } = useAppContext();

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState([]);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch user addresses from backend
  const fetchUserAddresses = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        // user not logged in — don't show toast spam, keep addresses empty
        setUserAddresses([]);
        setSelectedAddress(null);
        return;
      }

      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // backend returns { success: true, user: { addresses: [...] } }
      if (data?.success) {
        const addresses = data.user?.addresses || [];
        setUserAddresses(addresses);
        if (addresses.length > 0) setSelectedAddress(addresses[0]);
        else setSelectedAddress(null);
      } else {
        setUserAddresses([]);
        setSelectedAddress(null);
      }
    } catch (err) {
      console.error("❌ Failed to fetch addresses:", err);
      setUserAddresses([]);
      setSelectedAddress(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const handlePromoApply = () => {
    const code = promo.trim().toLowerCase();
    if (code === "save10") {
      setDiscount(0.1);
      toast.success("Promo applied: 10% off");
    } else {
      setDiscount(0);
      toast.error("Invalid promo code");
    }
  };

  const createOrder = async () => {
    if (!selectedAddress) return toast.error("Please select address first");

    const subtotal = getCartAmount();
    const tax = Math.floor(subtotal * 0.02);
    const discountAmount = Math.floor(subtotal * discount);
    const total = subtotal + tax - discountAmount;

    const orderData = {
      items: Object.values(cartItems),
      subtotal,
      discountPercent: discount * 100,
      tax,
      total,
      address: selectedAddress,
      date: new Date().toISOString(),
    };

    try {
      const token = await getToken();
      if (!token) {
        toast.error("User not authenticated!");
        return;
      }

      await axios.post("/api/order/create", orderData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Order placed successfully!");
      router.push("/orders");
    } catch (err) {
      console.error("❌ Order creation failed:", err);
      toast.error("Order creation failed!");
    }
  };

  // price calc
  const subtotal = getCartAmount();
  const tax = Math.floor(subtotal * 0.02);
  const discountAmount = Math.floor(subtotal * discount);
  const total = subtotal + tax - discountAmount;

  return (
    <div className="w-full md:w-96 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
        Order Summary
      </h2>
      <hr className="border-gray-300 mb-5" />

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
              userAddresses.map((address, index) => (
                <li
                  key={index}
                  onClick={() => handleAddressSelect(address)}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                >
                  {address.fullName}, {address.area || address.city}, {address.state}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-gray-500">No addresses found</li>
            )}
            <li
              onClick={() => {
                setIsDropdownOpen(false);
                router.push("/add-address");
              }}
              className="px-4 py-2 text-center text-orange-600 font-medium hover:bg-gray-100 cursor-pointer"
            >
              + Add New Address
            </li>
          </ul>
        )}
      </div>

      {/* Promo */}
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
        className="w-full bg-orange-600 text-white py-3 mt-6 rounded-md hover:bg-orange-700 transition font-medium"
      >
        Place Order
      </button>
    </div>
  );
};

export default OrderSummary;
