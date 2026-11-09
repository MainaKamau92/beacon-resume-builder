import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // native/browser-spawning packages stay out of the server bundle
  serverExternalPackages: ["puppeteer", "unpdf", "mammoth"],
  // /api/pdf drives headless Chrome at http://127.0.0.1/print. Next's dev
  // server blocks /_next/* for non-localhost origins, so without this the
  // print page never hydrates in dev and PDF export times out (prod is
  // unaffected — the block is dev-only).
  allowedDevOrigins: ["127.0.0.1"],
  // hide the dev-only "N" badge (it also leaked into dev-generated PDFs);
  // compile and runtime errors still show
  devIndicators: false,
};

export default nextConfig;
