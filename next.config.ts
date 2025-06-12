import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['recrivio-bucket.s3.ap-south-1.amazonaws.com'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    return config;
  },
};

export default nextConfig;
