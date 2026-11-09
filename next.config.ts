import type { NextConfig } from "next";
const config: NextConfig = {
  output: process.env.STATIC_EXPORT === "1" ? "export" : undefined,
  images: { unoptimized: true },
};
export default config;
