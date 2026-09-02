import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      katex: path.resolve(__dirname, "node_modules/katex"),
    };
    // Avoid stale PackFileCacheStrategy warnings when .next is rebuilt mid-dev
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
