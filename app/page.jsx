'use client'
import React from "react";
import HeaderSlider from "@/components/HeaderSlider";
import HomeProducts from "@/components/HomeProducts";
import Banner from "@/components/Banner";
import NewsLetter from "@/components/NewsLetter";
import FeaturedProduct from "@/components/FeaturedProduct";
// import ProductList from "@/components/ProductList";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32">
        <HeaderSlider />
        <HomeProducts />

        {/* ✅ Popular and Featured sections */}
        <h1 className="text-2xl font-semibold text-center mt-6">
          Popular Products
        </h1>
        {/* <PopularProduct /> */}

        {/* <h1 className="text-2xl font-semibold text-center mt-6">
          Featured Products
        </h1>
        <FeaturedProduct /> */}

        {/* ✅ Product List section */}
        {/* <ProductList /> */}

        <Banner />
        <NewsLetter />
      </div>
      <Footer />
    </>
  );
};

export default Home;
