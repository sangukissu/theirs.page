import { defineCloudflareConfig } from "@opennextjs/cloudflare";

const config = defineCloudflareConfig();

// Next.js 16 defaults to Turbopack, whose external-package aliases are
// platform-specific symlinks. Building with Webpack avoids unresolved aliases
// such as `sharp-<hash>` when Workers Builds runs on Linux.
config.buildCommand = "npm run build:next";

export default config;
