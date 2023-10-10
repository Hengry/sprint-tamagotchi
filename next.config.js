const withTwin = require('./withTwin.js');

/** @type {import('next').NextConfig} */
const nextConfig = withTwin({
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
});

module.exports = nextConfig;
