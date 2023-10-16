/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@deepgram/sdk/dist/browser'],
}

module.exports = nextConfig
