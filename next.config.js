/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      jsdom: false,
    };
    return config;
  },
  transpilePackages: ['@heroicons/react']
}

module.exports = nextConfig