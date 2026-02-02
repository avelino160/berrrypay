import { spawn } from "child_process";

// Start Next.js dev server
const nextProcess = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
});

nextProcess.on("error", (err) => {
  console.error("Failed to start Next.js:", err);
  process.exit(1);
});

nextProcess.on("close", (code) => {
  process.exit(code ?? 0);
});
