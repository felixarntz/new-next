import { logger } from "@felixarntz/cli-utils";
import { exec } from "./utils/exec.js";

export async function cleanup(): Promise<void> {
  logger.info("Running cleanup...");
  await exec("bun fix");
  logger.success("Cleanup complete.");
}
