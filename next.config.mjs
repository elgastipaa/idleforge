import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig | ((phase: string) => import('next').NextConfig)} */
const nextConfig = (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    output: "standalone",
    outputFileTracingRoot: projectRoot,
    distDir: isDev ? ".next-dev" : ".next",
    experimental: {
      devtoolSegmentExplorer: false
    }
  };
};

export default nextConfig;
