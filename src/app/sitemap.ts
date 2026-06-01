import type { MetadataRoute } from "next";
import { vehicleRepository } from "@/lib/data";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const vehicles = await vehicleRepository.list({ includeSold: true });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/bikes`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const vehicleRoutes: MetadataRoute.Sitemap = vehicles.map((v) => ({
    url: `${base}/${v.type}/${v.id}`,
    lastModified: new Date(v.createdAt),
    changeFrequency: "weekly",
    priority: v.isSold ? 0.3 : 0.7,
  }));

  return [...staticRoutes, ...vehicleRoutes];
}
