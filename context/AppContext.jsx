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
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "₹";
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem("cartItems");
    if (saved) setCartItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

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
      } else {
        setUserData(userDummyData);
      }
    } catch (error) {
      console.warn("User fetch failed:", error.message);
      setUserData(userDummyData);
    }
  };

  const syncCartToServer = async (newCart) => {
    if (!user) return;

    try {
      const token = await getToken();
      const formattedCart = Object.values(newCart).map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.offerPrice || item.price,
        imageUrl: item.imageUrl || "",
        quantity: item.quantity,
      }));

      const res = await fetch("/api/cart/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          cartItems: formattedCart,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sync cart");

      console.log("✅ Cart synced to server:", data);
    } catch (err) {
      console.error("❌ syncCartToServer failed:", err.message);
    }
  };

  const addToCart = (product, qty = 1) => {
    if (!product?._id) return toast.error("Invalid product");

    setCartItems((prev) => {
      const next = { ...prev };
      const productId = product._id;

      if (next[productId]) {
        next[productId].quantity += qty;
      } else {
        next[productId] = { ...product, quantity: qty };
      }

      syncCartToServer(next);
      return next;
    });

    toast.success(`${product.name || "Item"} added to cart`);
  };

  const updateCartQuantity = (productId, quantity) => {
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

  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      syncCartToServer(next);
      return next;
    });
    toast.success("Item removed");
  };

  const getCartAmount = () =>
    Object.values(cartItems).reduce(
      (sum, item) => sum + (item.offerPrice || item.price || 0) * (item.quantity || 0),
      0
    );

  const getCartCount = () =>
    Object.values(cartItems).reduce((sum, item) => sum + (item.quantity || 0), 0);

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
