/** @type {import('next').NextConfig} */
const nextConfig = {
  // `next dev` and `next build` both write to .next, so a build run while the
  // dev server is up replaces the chunks dev is serving and it starts throwing
  // "Cannot find module './<id>.js'". Setting NEXT_DIST_DIR lets a verification
  // build write somewhere else. Unset (dev, CI, Docker) it stays .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
