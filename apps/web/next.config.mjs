/** @type {import('next').NextConfig} */

// Express API origin, reachable from the Next.js server. Browser requests to /api/* are proxied to
// it, so cart and order cookies are first-party and the API needs no cross-site cookies.
const apiOrigin = process.env.API_ORIGIN ?? 'http://localhost:4000';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${apiOrigin}/api/:path*` }];
  }
};

export default nextConfig;
