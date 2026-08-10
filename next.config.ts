import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vbpdzttyhqnxcwchoobo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/obras",
        destination: "/resenas/obras",
        permanent: true,
      },
      {
        source: "/obras/:path*",
        destination: "/resenas/obras/:path*",
        permanent: true,
      },
      {
        source: "/reseñas",
        destination: "/resenas",
        permanent: true,
      },
      {
        source: "/reseñas/:path*",
        destination: "/resenas/:path*",
        permanent: true,
      },
      {
        source: "/rese%C3%B1as",
        destination: "/resenas",
        permanent: true,
      },
      {
        source: "/rese%C3%B1as/:path*",
        destination: "/resenas/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
