/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // ✅ Remote images allowed
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "store.storeimages.cdn-apple.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "your-domain.com",
        pathname: "**",
      },
    ],

    // ✅ For backward compatibility
    domains: [
      "res.cloudinary.com",
      "raw.githubusercontent.com",
      "store.storeimages.cdn-apple.com",
      "via.placeholder.com",
      "your-domain.com",
    ],
  },

  // ✅ Webpack config for 3D models (.glb / .usdz / .gltf)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|usdz)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/models/[name][ext]", // output path inside .next
      },
    });

    return config;
  },
};

export default nextConfig;
