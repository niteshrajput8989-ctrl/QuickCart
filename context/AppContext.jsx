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

  // ✅ Load cart safely
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("cartItems")) || {};
      if (typeof saved === "object") setCartItems(saved);
    } catch {
      localStorage.removeItem("cartItems");
    }
  }, []);

  // ✅ Save cart
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Fetch products
  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data?.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts(productsDummyData);
      }
    } catch {
      setProducts(productsDummyData);
    }
  };

  // ✅ Fetch user
  const fetchUserData = async () => {
    try {
      if (user?.publicMetadata?.role === "seller") setIsSeller(true);
      const token = await getToken();
      if (!token) return setUserData(userDummyData);

      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data?.success && data.user) setUserData(data.user);
      else setUserData(userDummyData);
    } catch {
      setUserData(userDummyData);
    }
  };

  // ✅ Sync cart
  const syncCartToServer = async (newCart) => {
    if (!user) return;
    try {
      const token = await getToken();
      const formattedCart = Object.values(newCart)
        .filter((i) => i && i._id)
        .map((i) => ({
          productId: i._id,
          name: i.name,
          price: i.offerPrice ?? i.price ?? 0,
          imageUrl: i.imageUrl || "",
          quantity: i.quantity || 1,
        }));

      await fetch("/api/cart/update", {
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
    } catch (err) {
      console.warn("Cart sync failed:", err.message);
    }
  };

  // ✅ Add to Cart (safe)
  const addToCart = (product, qty = 1) => {
    if (!product || !product._id) return toast.error("Invalid product");
    setCartItems((prev) => {
      const next = { ...prev };
      const existing = next[product._id] || {};
      next[product._id] = {
        ...existing,
        ...product,
        offerPrice: product.offerPrice ?? product.price ?? 0,
        quantity: (existing.quantity || 0) + qty,
      };
      syncCartToServer(next);
      return next;
    });
    toast.success(`${product.name} added`);
  };

  // ✅ Update Quantity
  const updateCartQuantity = (productId, quantity) => {
    setCartItems((prev) => {
      const next = { ...prev };
      if (!next[productId]) return prev;
      if (quantity <= 0) delete next[productId];
      else next[productId].quantity = quantity;
      syncCartToServer(next);
      return next;
    });
  };

  // ✅ Remove from Cart
  const removeFromCart = (productId) => {
    setCartItems((prev) => {
      const next = { ...prev };
      delete next[productId];
      syncCartToServer(next);
      return next;
    });
    toast.success("Item removed");
  };

  // ✅ Safe total
  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const i = cartItems[id];
      if (!i) continue;
      const price = Number(i.offerPrice ?? i.price ?? 0);
      const qty = Number(i.quantity ?? 1);
      total += price * qty;
    }
    return total;
  };

  // ✅ Count
  const getCartCount = () =>
    Object.values(cartItems).reduce(
      (sum, i) => sum + (i?.quantity ?? 0),
      0
    );

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
