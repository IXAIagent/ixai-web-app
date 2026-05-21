import type { MetadataRoute } from "next";
import {
  ixaiDefaultDescription,
  ixaiDefaultTitle,
} from "@/src/lib/brand/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#fff7e8",
    description: ixaiDefaultDescription,
    display: "standalone",
    icons: [
      {
        sizes: "any",
        src: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        sizes: "512x512",
        src: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    name: ixaiDefaultTitle,
    short_name: "IXAI",
    start_url: "/",
    theme_color: "#09291f",
  };
}
