const QUICK_REFERENCE_RE = /^## Quick Reference\n[\s\S]*?^---\n\n?/m;
const ULTRACITE_FIX_RE = /\b(?:bun x|bunx|pnpm dlx) ultracite fix/g;
const ULTRACITE_HEADER_RE = /^# Ultracite Code Standards$/m;

export function removeQuickReferenceSection(content: string): string {
  return content.replace(QUICK_REFERENCE_RE, "");
}

export function replaceUltraciteFixCommand(opts: {
  content: string;
  fixCommand: string;
}): string {
  return opts.content.replace(ULTRACITE_FIX_RE, opts.fixCommand);
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
