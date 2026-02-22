#!/usr/bin/env node

import { resolve } from "node:path";
import { program } from "@commander-js/extra-typings";
import {
  getArgs,
  getOpt,
  logger,
  withErrorHandling,
  withOptions,
} from "@felixarntz/cli-utils";
import { cleanup } from "./cleanup.js";
import { setupAiElements } from "./setup-ai-elements.js";
import { setupAiSdk } from "./setup-ai-sdk.js";
import { setupFoundation } from "./setup-foundation.js";
import { setupShadcn } from "./setup-shadcn.js";

program
  .name("new-next")
  .description("Initialize a fresh modern Next.js project")
  .version("0.1.0");

withOptions(program, [
  {
    argname: "directory",
    description: "Target directory for the new project",
    positional: true,
  },
  { argname: "--shadcn", description: "Include shadcn components" },
  { argname: "--ai-sdk", description: "Include AI SDK" },
  {
    argname: "--ai-elements",
    description: "Include AI Elements (requires --shadcn)",
  },
]).action(
  withErrorHandling(async (...handlerArgs) => {
    const opt = getOpt(handlerArgs);
    const args = getArgs(handlerArgs);

    if (
      typeof args[0] === "string" &&
      args[0] !== "." &&
      // TODO: `getArgs` returns a string "undefined" for missing positional args, which is not ideal.
      args[0] !== "undefined"
    ) {
      const projectDir = resolve(args[0]);
      process.chdir(projectDir);
    }

    if (opt.aiElements && !opt.shadcn) {
      throw new Error("--ai-elements requires --shadcn");
    }

    await setupFoundation();

    if (opt.shadcn) {
      await setupShadcn();
    }

    if (opt.aiSdk) {
      await setupAiSdk();
    }

    if (opt.aiElements) {
      await setupAiElements();
    }

    await cleanup();

    logger.success("Project initialized successfully!");
  })
);

program.parse();
