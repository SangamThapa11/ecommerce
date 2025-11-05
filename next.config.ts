import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co"
      },
      {
        hostname: "res.cloudinary.com"
      }
    ]
  }
};

export default nextConfig;
