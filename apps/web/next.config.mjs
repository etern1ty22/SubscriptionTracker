/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@subscription-tracker/shared"]
};

export default nextConfig;
