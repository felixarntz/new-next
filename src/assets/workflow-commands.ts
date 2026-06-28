import type { PackageManagerOptions } from "../utils/package-manager.js";
import { getPackageManagerConfig } from "../utils/package-manager.js";

export function getWorkflowCommandsContent(
  opts: PackageManagerOptions
): string {
  const { workflowCommands } = getPackageManagerConfig(opts);
  const note = workflowCommands.note ? `\n${workflowCommands.note}\n` : "";

  return `# Workflow Commands

Available scripts for this project, run via \`${workflowCommands.packageManager}\`:

- \`${workflowCommands.dev}\` — Start the Next.js development server
- \`${workflowCommands.build}\` — Create a production build
- \`${workflowCommands.start}\` — Serve the production build
- \`${workflowCommands.check}\` — Check code for linting and formatting issues
- \`${workflowCommands.fix}\` — Auto-fix linting and formatting issues
- \`${workflowCommands.typecheck}\` — Run TypeScript type checking
- \`${workflowCommands.doctor}\` — Diagnose the Ultracite/Biome setup
${note}
${workflowCommands.installPreference}
`;
}
