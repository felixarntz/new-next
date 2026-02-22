const QUICK_REFERENCE_RE = /^## Quick Reference\n[\s\S]*?^---\n\n?/m;
const ULTRACITE_FIX_RE = /bun x ultracite fix/g;
const ULTRACITE_HEADER_RE = /^# Ultracite Code Standards$/m;

export function removeQuickReferenceSection(content: string): string {
  return content.replace(QUICK_REFERENCE_RE, "");
}

export function replaceUltraciteFixCommand(content: string): string {
  return content.replace(ULTRACITE_FIX_RE, "bun fix");
}

export function prependBeforeUltraciteHeader(opts: {
  content: string;
  prepend: string;
}): string {
  return opts.content.replace(
    ULTRACITE_HEADER_RE,
    `${opts.prepend}\n# Ultracite Code Standards`
  );
}
