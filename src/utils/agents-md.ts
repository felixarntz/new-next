const QUICK_REFERENCE_RE = /^## Quick Reference\n[\s\S]*?^---\n\n?/m;
const ULTRACITE_FIX_RE = /\b(?:bun x|bunx|pnpm dlx) ultracite fix/g;
const ULTRACITE_HEADER_RE = /^# Ultracite Code Standards$/m;
const TOP_LEVEL_HEADER_RE = /^# .+$/m;
const HORIZONTAL_RULE_RE = /^---$/m;
const MARKDOWN_BLOCK_SEPARATOR_RE = /\n{2,}/;

export function removeQuickReferenceSection(content: string): string {
  return content.replace(QUICK_REFERENCE_RE, "");
}

function findNextTopLevelHeader(opts: {
  content: string;
  startIndex: number;
}): number {
  const match = TOP_LEVEL_HEADER_RE.exec(opts.content.slice(opts.startIndex));
  return match?.index === undefined
    ? opts.content.length
    : opts.startIndex + match.index;
}

function getMarkdownBlocks(content: string): string[] {
  return content
    .trim()
    .split(MARKDOWN_BLOCK_SEPARATOR_RE)
    .map((block) => block.trim())
    .filter(Boolean);
}

function isParagraphBlock(block: string): boolean {
  return !(block.startsWith("#") || HORIZONTAL_RULE_RE.test(block));
}

export function condenseUltraciteCodeStandardsSection(content: string): string {
  const headerMatch = ULTRACITE_HEADER_RE.exec(content);
  if (!headerMatch) {
    return content;
  }

  const sectionStart = headerMatch.index;
  const sectionBodyStart = sectionStart + headerMatch[0].length;
  const sectionEnd = findNextTopLevelHeader({
    content,
    startIndex: sectionBodyStart,
  });
  const sectionBody = content.slice(sectionBodyStart, sectionEnd);
  const firstParagraph = getMarkdownBlocks(sectionBody).find(isParagraphBlock);
  const lastBody = sectionBody.split(HORIZONTAL_RULE_RE).at(-1) ?? sectionBody;
  const lastParagraph = getMarkdownBlocks(lastBody)
    .toReversed()
    .find(isParagraphBlock);

  if (!(firstParagraph && lastParagraph)) {
    return content;
  }

  const retainedParagraphs =
    firstParagraph === lastParagraph
      ? [firstParagraph]
      : [firstParagraph, lastParagraph];
  const condensedSection = [headerMatch[0], ...retainedParagraphs].join("\n\n");
  const trailingContent = content.slice(sectionEnd).trimStart();

  return `${content.slice(0, sectionStart)}${condensedSection}\n${
    trailingContent ? `\n${trailingContent}` : ""
  }`;
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
