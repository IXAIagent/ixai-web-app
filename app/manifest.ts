import type { MetadataRoute } from "next";
import {
  ixaiDefaultDescription,
} from "@/src/lib/brand/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f5f0e6",
    description: ixaiDefaultDescription,
    display: "standalone",
    icons: [
      {
        sizes: "192x192",
        src: "/icons/ixai-icon-192.png",
        type: "image/png",
      },
      {
        sizes: "512x512",
        src: "/icons/ixai-icon-512.png",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/ixai-maskable-512.png",
        type: "image/png",
      },
    ],
    name: "IXAI",
    scope: "/",
    short_name: "IXAI",
    start_url: "/",
    theme_color: "#09291f",
  };
}
