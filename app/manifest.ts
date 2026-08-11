import type {
  MetadataRoute,
} from "next";

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name: "Anna AI",

    short_name: "Anna AI",

    description:
      "Practice Chinese speaking, HSK vocabulary, writing and pronunciation with Anna AI.",

    start_url: "/app-home",

    scope: "/",

    display: "standalone",

    background_color: "#09030f",

    theme_color: "#09030f",

    orientation: "portrait",

    icons: [
      {
        src: "/pwa/anna-ai-logo.jpg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}