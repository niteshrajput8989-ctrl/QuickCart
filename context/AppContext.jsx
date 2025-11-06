"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { productsDummyData, userDummyData } from "@/assets/assets";

export const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);

  // 🛒 Cart stores full product objects now
  const [cartItems, setCartItems] = useState({});

  // 🧠 Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cartItems");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  // 💾 Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // 📦 Fetch products
  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data?.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.warn("Product fetch failed:", error.message);
      setProducts(productsDummyData);
      toast.error("Using dummy products (API error)");
    }
  };

  // 👤 Fetch user data
  const fetchUserData = async () => {
    try {
      if (user?.publicMetadata?.role === "seller") setIsSeller(true);
      const token = await getToken();
      if (!token) {
        setUserData(userDummyData);
        return;
      }

      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success && data?.user) {
        setUserData(data.user);
      }
    } catch (error) {
      console.warn("User fetch failed:", error.message);
      setUserData(userDummyData);
    }
  };

  // ☁️ Sync cart with server
  const syncCartToServer = async (newCart) => {
    if (!user) return;
    try {
      const token = await getToken();
      await axios.post(
        "/api/cart/update",
        { cartItems: newCart },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("syncCartToServer failed:", err?.response?.data || err.message);
    }
  };

  // 🧩 Add to cart (store full product)
  const addToCart = async (product, qty = 1) => {
    if (!product?._id) return toast.error("Invalid product");

    const productId = product._id;

    setCartItems((prev) => {
      const next = { ...prev };

      if (next[productId]) {
        next[productId].quantity += qty;
      } else {
        next[productId] = {
          ...product,
          quantity: qty,
        };
      }

      syncCartToServer(next);
      return next;
    });

    toast.success(`${product.name || "Item"} added to cart`);
  };

  // 🔢 Update quantity
  const updateCartQuantity = async (productId, quantity) => {
    const q = Number(quantity);
    setCartItems((prev) => {
      const next = { ...prev };
      if (!next[productId]) return prev;

      if (q <= 0) {
        delete next[productId];
      } else {
        next[productId].quantity = q;
      }

      syncCartToServer(next);
      return next;
    });
  };

  // ❌ Remove item
  const removeFromCart = async (productId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      syncCartToServer(next);
      return next;
    });
    toast.success("Item removed");
  };

  // 💰 Calculate total price
  const getCartAmount = () =>
    Object.values(cartItems).reduce(
      (sum, item) => sum + (item.offerPrice || item.price || 0) * (item.quantity || 0),
      0
    );

  // 🧮 Count total items
  const getCartCount = () =>
    Object.values(cartItems).reduce((sum, item) => sum + (item.quantity || 0), 0);

  // 🔁 Fetch data
  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (user) fetchUserData();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        getToken,
        currency,
        router,
        isSeller,
        setIsSeller,
        userData,
        products,
        cartItems,
        setCartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        getCartCount,
        getCartAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
