/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  cacheStartUrl: true, // Cache the start URL
  runtimeCaching: [
    {
      // Cache API responses
      urlPattern: /^https:\/\/api\.example\.com\/.*$/,
      method: "GET",
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: {
          maxEntries: 10, // Cache up to 50 API responses
          maxAgeSeconds: 30 * 60, // Cache for 0.5 hour
        },
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
