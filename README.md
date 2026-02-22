# new-next

CLI tool to initialize an opinionated Next.js project with Bun and Ultracite. Optionally install shadcn, AI SDK, and AI Elements.

## What You Get

- **Next.js + Bun + Tailwind CSS** — Fast dev server, builds, and package management out of the box
- **Ultracite + Biome** — Zero-config linting, formatting, and pre-commit hooks via Husky
- **Agent-ready** — AGENTS.md with coding guidelines, auto-formatting hooks, and workflow commands
- **GitHub CI** — Built-in workflow for linting, type checking, and build verification
- **Optional AI stack** — shadcn components, Vercel AI SDK, and AI Elements optionally installed via flags

## Usage

```bash
npx new-next [directory] [options]
```

By default, this will set up the new Next.js project in the current directory. Optionally pass a `directory` path to set up the project there instead.

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

## License

Licensed under the MIT License.
