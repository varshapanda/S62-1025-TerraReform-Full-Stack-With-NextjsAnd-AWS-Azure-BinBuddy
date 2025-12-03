import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "binbuddy-reports.s3.ap-south-1.amazonaws.com",
        pathname: "/reports/**",
      },
    ],
  },
};

export default nextConfig;
