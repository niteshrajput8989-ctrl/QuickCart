"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

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
  const [cartItems, setCartItems] = useState([]); // ✅ store product objects

  // ✅ Fetch all products
  const fetchProductData = async () => {
    try {
      const { data } = await axios.get("/api/product/list");
      if (data?.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (error) {
      console.warn("⚠️ Product fetch failed:", error.message);
      setProducts(productsDummyData); // fallback
      toast.error("Using dummy products (API error)");
    }
  };

  // ✅ Fetch user data
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
        throw new Error("Invalid user response");
      }
    } catch (error) {
      console.warn("⚠️ User fetch failed:", error.message);
      setUserData(userDummyData);
    }
  };

  // 🛒 Add to Cart
  const addToCart = (product) => {
    if (!product) return;
    setCartItems((prev) => {
      const existing = prev.find(
        (p) => String(p._id) === String(product._id) || String(p.id) === String(product.id)
      );
      if (existing) {
        return prev.map((p) =>
          String(p._id) === String(product._id) || String(p.id) === String(product.id)
            ? { ...p, quantity: (p.quantity || 1) + 1 }
            : p
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    toast.success(`${product.name} added to cart`);
  };

  // 🧮 Update cart quantity
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) =>
        prev.filter((item) => String(item._id) !== String(id) && String(item.id) !== String(id))
      );
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        String(item._id) === String(id) || String(item.id) === String(id)
          ? { ...item, quantity }
          : item
      )
    );
  };

  // ❌ Remove item from cart
  const removeFromCart = (id) => {
    setCartItems((prev) =>
      prev.filter((item) => String(item._id) !== String(id) && String(item.id) !== String(id))
    );
    toast.error("Item removed");
  };

  // 🧾 Cart total amount
  const getCartAmount = () =>
    cartItems.reduce(
      (sum, item) => sum + (item.offerPrice || item.price || 0) * (item.quantity || 1),
      0
    );

  // 🧮 Cart item count
  const getCartCount = () =>
    cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
        fetchUserData,
        products,
        fetchProductData,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartCount,
        getCartAmount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
