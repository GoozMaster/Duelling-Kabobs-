import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is a stray package-lock.json in the user's home directory, which
  // makes Turbopack infer C:\Users\Neema as the workspace root. Pin the root
  // to this project so builds resolve files from here.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
