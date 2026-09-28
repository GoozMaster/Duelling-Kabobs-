import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // There is a stray package-lock.json in the user's home directory, which
  // makes Turbopack infer C:\Users\Neema as the workspace root. Pin the root
  // to this project so builds resolve files from here.
  turbopack: {
    root: import.meta.dirname,
  },
  // What's in Stock moved from /admin/stock to the public /stock once visitors
  // could view it. An HTTP redirect rather than redirect() in a page: the admin
  // layout streams the header first, which turns redirect() into a client-side
  // hop that drops the #pantry / #fridge / #freezer fragment. Browsers carry
  // the fragment across a real 3xx. Temporary (307) so no browser caches it
  // forever, in case the path is ever reused.
  async redirects() {
    return [{ source: "/admin/stock", destination: "/stock", permanent: false }];
  },
};

export default nextConfig;
