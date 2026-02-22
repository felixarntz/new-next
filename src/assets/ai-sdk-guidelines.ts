export function getAiSdkGuidelinesContent(): string {
  return `# AI SDK Guidelines

This project uses the AI SDK in its latest version. It is critical to consider the version number, so that you don't apply outdated or unsupported patterns.

## Never import \`gateway\` or \`createGateway\`

The AI Gateway is the default global provider, so you can access models using a simple string.

**BAD:**
\`\`\`ts
import { generateText } from 'ai';
import { gateway } from '@ai-sdk/gateway';

const { text } = await generateText({
  model: gateway('anthropic/claude-sonnet-4.5'),
  prompt: 'What is love?',
});
\`\`\`

**GOOD:**
\`\`\`ts
import { generateText } from 'ai';

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.5',
  prompt: 'What is love?',
});
\`\`\`
`;
}
