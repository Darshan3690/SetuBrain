import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["falkordb"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
