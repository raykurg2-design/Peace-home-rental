import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@electric-sql/pglite", "resend"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "peacehomerental.com",
        pathname: "/properties/**",
      },
    ],
  },
  headers: async () => [
    {
      source: "/manifest.webmanifest",
      headers: [
        {
          key: "Content-Type",
          value: "application/manifest+json",
        },
      ],
    },
  ],
};

export default nextConfig;
