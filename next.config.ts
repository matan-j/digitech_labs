import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse + mammoth use Node-native code paths that don't play with webpack RSC bundling.
  serverExternalPackages: ["pdf-parse", "mammoth"],
};

export default nextConfig;
