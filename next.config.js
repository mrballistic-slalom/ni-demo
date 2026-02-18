/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  webpack: (config, { isServer }) => {
    // Force webpack to use Tone.js ESM build (not the UMD bundle)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        tone: require.resolve('tone/build/esm/index.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;
