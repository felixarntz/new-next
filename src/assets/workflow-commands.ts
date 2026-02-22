export function getWorkflowCommandsContent(): string {
  return `# Workflow Commands

Available scripts for this project, run via \`bun\`:

- \`bun dev\` — Start the Next.js development server
- \`bun run build\` — Create a production build
- \`bun start\` — Serve the production build
- \`bun check\` — Check code for linting and formatting issues
- \`bun fix\` — Auto-fix linting and formatting issues
- \`bun run doctor\` — Diagnose the Ultracite/Biome setup

Note: \`build\` and \`doctor\` need \`bun run\` since they conflict with built-in bun commands.

In general, default to using Bun instead of Node.js.
`;
}
