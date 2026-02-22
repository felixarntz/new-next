# new-next

CLI tool to initialize opinionated Next.js projects with Bun, Ultracite, and optional shadcn, AI SDK, and AI Elements support.

## Usage

```bash
npx new-next [options]
```

### Options

- `--shadcn` — Include shadcn components
- `--ai-sdk` — Include AI SDK
- `--ai-elements` — Include AI Elements (requires `--shadcn`)

## Development

```bash
bun install
bun run src/index.ts --help
bun run build
```
