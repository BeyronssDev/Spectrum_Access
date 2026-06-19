import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@accessibilitat/shared"],
  output: "export"
};

export default nextConfig;
