import type {
  MetadataRoute,
} from "next";


export default function manifest():
MetadataRoute.Manifest {
  return {
    name:
      "Anna AI",

    short_name:
      "Anna AI",

    description:
      "Practice Chinese speaking, HSK vocabulary, writing and pronunciation with Anna AI.",

    start_url:
      "/app-home",

    scope:
      "/",

    display:
      "standalone",

    background_color:
      "#160020",

    theme_color:
      "#160020",

    orientation:
      "portrait",

    icons: [
      {
        src:
          "/pwa/anna-ai-icon.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "any",
      },

      {
        src:
          "/pwa/anna-ai-icon.png",

        sizes:
          "512x512",

        type:
          "image/png",

        purpose:
          "maskable",
      },
    ],
  };
}