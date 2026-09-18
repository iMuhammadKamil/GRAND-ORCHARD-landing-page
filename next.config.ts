import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow the sandbox preview origin to fetch dev-mode /_next resources
  // (dev.log previously warned about cross-origin requests from this host).
  allowedDevOrigins: [
    "*.space-z.ai",
    "preview-chat-e8bd6f23-91d6-4477-9735-01f921a0086c.space-z.ai",
  ],
  images: {
    qualities: [75, 80, 82, 85, 88, 90],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
