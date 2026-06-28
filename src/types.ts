import type { PackageManagerOptions } from "./utils/package-manager.js";

export interface SetupOptions extends PackageManagerOptions {
  skipSkills?: boolean;
}
