/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    basePath: process.env.basePath,
    env: {
      basePath: process.env.basePath,
    },
};

export default nextConfig;
