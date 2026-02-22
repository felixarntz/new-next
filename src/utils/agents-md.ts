export function removeQuickReferenceSection(content: string): string {
  return content.replace(/^## Quick Reference\n[\s\S]*?^---\n\n?/m, "");
}

export function replaceUltraciteFixCommand(content: string): string {
  return content.replace(/bun x ultracite fix/g, "bun fix");
}

export function prependBeforeUltraciteHeader(opts: {
  content: string;
  prepend: string;
}): string {
  return opts.content.replace(
    /^# Ultracite Code Standards$/m,
    `${opts.prepend}\n# Ultracite Code Standards`
  );
}
