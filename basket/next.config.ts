import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // App ini hidup di subfolder repo; kunci root supaya tidak ikut app induk.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
