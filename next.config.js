/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack(config, { isServer }) {
    if (!isServer) {
      // Ensure only one instance of GenerateSW is being added
      config.plugins = config.plugins.filter(
        (plugin) => plugin.constructor.name !== "GenerateSW"
      );
    }
    return config;
  },
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: true, // Cache the start URL
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/merry-treacle-887c5b\.netlify\.app\/api\/.*$/,
      handler: "NetworkFirst", // Tries network first; falls back to cache if offline
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 50, // Max items in the cache
          maxAgeSeconds: 60 * 60 * 24 * 7, // Cache for 7 days
        },
        networkTimeoutSeconds: 10, // Falls back to cache if no response in 10 seconds
      },
    },
    {
      // Cache static assets like images
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        expiration: {
          maxEntries: 100, // Cache up to 100 images
          maxAgeSeconds: 7 * 24 * 60 * 60, // Cache for 1 week
        },
      },
    },
    {
      // Cache CSS and JavaScript files
      urlPattern: /\.(?:js|css)$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
        expiration: {
          maxEntries: 100, // Cache up to 100 files
          maxAgeSeconds: 30 * 24 * 60 * 60, // Cache for 30 days
        },
      },
    },
  ],
});

module.exports = withPWA(nextConfig);
