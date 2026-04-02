/** @type {import('next').NextConfig} */
const isDesktopBuild = process.env.NEXT_PUBLIC_IS_DESKTOP === 'true';

const nextConfig = {
  images: isDesktopBuild
    ? {
        unoptimized: true,
      }
    : undefined,
  output: isDesktopBuild ? 'export' : undefined,
  trailingSlash: isDesktopBuild,
}

module.exports = nextConfig
