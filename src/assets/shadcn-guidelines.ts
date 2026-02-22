export function getShadcnGuidelinesContent(): string {
  return `# shadcn Guidelines

This project uses shadcn components.

To add a new component, use \`pnpm dlx shadcn@latest add <component>\`. Example:
\`\`\`bash
bunx --bun shadcn@latest add button
\`\`\`

To search for available components in the shadcn registry, use:
\`\`\`bash
bunx --bun shadcn@latest search @shadcn
\`\`\`

You can optionally provide a \`-q\` parameter with a search query:
\`\`\`bash
bunx --bun shadcn@latest search @shadcn -q "button"
\`\`\`
`;
}
