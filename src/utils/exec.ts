import { spawn } from "node:child_process";

export function exec(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: "inherit",
      shell: true,
      cwd: process.cwd(),
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}: ${command}`));
      }
    });
    child.on("error", reject);
  });
}
