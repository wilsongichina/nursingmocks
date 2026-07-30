import type { NextConfig } from "next";

const firebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["firebase"],
  async redirects() {
    return [
      {
        source: "/teas-7-practice",
        destination: "/ati-teas-practice-test",
        permanent: true,
      },
      {
        source: "/teas-7-practice-test",
        destination: "/ati-teas-practice-test",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.gstatic.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/v0/b/**",
      },
      ...(firebaseStorageBucket
        ? [
            {
              protocol: "https" as const,
              hostname: firebaseStorageBucket,
              port: "",
              pathname: "/**",
            },
          ]
        : []),
    ],
    unoptimized: false, // Keep optimization enabled but allow fallback
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
