import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["s3.bistro.app.br"],
  },
  async headers() {
    // Desativa headers de segurança em desenvolvimento
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      return [];
    }

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://s3.bistro.app.br https://lh3.googleusercontent.com; font-src 'self' data:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://api.bistro.app.br https://cdn.omie.com.br; frame-src 'self' https://accounts.google.com",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
