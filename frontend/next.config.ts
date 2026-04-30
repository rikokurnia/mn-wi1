import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack config (Next.js 16 uses Turbopack by default)
  turbopack: {},

  // Suppress known Solana wallet adapter hydration warning
  experimental: {
    optimizePackageImports: ['@solana/wallet-adapter-react', '@solana/wallet-adapter-react-ui'],
  },
};

export default nextConfig;
