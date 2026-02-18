/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/ni-demo' : '';

const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: isProd ? '/ni-demo/' : '',
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
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
