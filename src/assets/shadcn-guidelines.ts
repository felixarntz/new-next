import type { PackageManagerOptions } from "../utils/package-manager.js";
import { getPackageManagerConfig } from "../utils/package-manager.js";

export function getShadcnGuidelinesContent(
  opts: PackageManagerOptions
): string {
  const { shadcnCommand } = getPackageManagerConfig(opts);

  return `# shadcn Guidelines

This project uses shadcn components.

To add a new component, use \`${shadcnCommand} add <component>\`. Example:
\`\`\`bash
${shadcnCommand} add button
\`\`\`

To search for available components in the shadcn registry, use:
\`\`\`bash
${shadcnCommand} search @shadcn
\`\`\`

You can optionally provide a \`-q\` parameter with a search query:
\`\`\`bash
${shadcnCommand} search @shadcn -q "button"
\`\`\`
`;
}
