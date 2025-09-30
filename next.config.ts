import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["s3.bistro.app.br", "cdn.omie.com.br", "omie.com.br"],
  },
  webpack: (config, { isServer }) => {
    // Configuração para arquivos WASM
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Configuração para arquivos WASM do ZXing
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    // Configuração para resolver arquivos WASM
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    return config;
  },
  async headers() {
    // Desativa headers de segurança em desenvolvimento
    if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
      console.log(process.env.NEXT_PUBLIC_NODE_ENV);
      return [];
    }

    return [
      // Headers específicos para arquivos WASM
      {
        source: "/(.*\\.wasm)",
        headers: [
          {
            key: "Content-Type",
            value: "application/wasm",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
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
              "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://s3.bistro.app.br https://lh3.googleusercontent.com https://cdn.omie.com.br https://www.omie.com.br; font-src 'self' data:; connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://www.googleapis.com https://api.bistro.app.br https://fastly.jsdelivr.net; frame-src 'self' https://accounts.google.com; worker-src 'self' blob:; child-src 'self' blob:; media-src 'self' data: blob:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
