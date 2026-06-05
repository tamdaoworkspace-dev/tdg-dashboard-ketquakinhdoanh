/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // xuất site tĩnh -> KHÔNG có serverless function
  images: { unoptimized: true },
  trailingSlash: true,
};
module.exports = nextConfig;
