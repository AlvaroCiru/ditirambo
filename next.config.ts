import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/obras",
        destination: "/reseñas/obras",
        permanent: true,
      },
      {
        source: "/obras/:path*",
        destination: "/reseñas/obras/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
