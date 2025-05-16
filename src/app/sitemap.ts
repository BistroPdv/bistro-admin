import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://admin.bistro.app.br"; // Substitua pelo seu domínio real

  // Rotas estáticas
  const staticRoutes = [
    "",
    "/dashboard",
    "/products",
    "/users",
    "/orders",
    "/printers",
    "/settings",
    "/tables",
    "/providers",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  return [...staticRoutes];
}
