import { cp, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = process.cwd();

function runGit(args) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout;
}

async function main() {
  const gitDir = runGit(["rev-parse", "--git-dir"]).trim();
  const backupRoot = resolve(repoRoot, gitDir, ".safe-commit-backups");
  const backupName = process.argv[2];

  if (!backupName) {
    console.error("[safe-commit] 用法: pnpm commit:restore <backup-name>");
    process.exit(1);
  }

  const backupDir = join(backupRoot, backupName);
  const snapshotDir = join(backupDir, "snapshot");
  const metaPath = join(backupDir, "meta.json");

  if (!existsSync(metaPath)) {
    console.error(`[safe-commit] 未找到备份: ${backupName}`);
    process.exit(1);
  }

  const meta = JSON.parse(await readFile(metaPath, "utf8"));

  if (existsSync(snapshotDir)) {
    await cp(snapshotDir, repoRoot, { recursive: true, force: true });
  }

  console.log(`[safe-commit] 已恢复工作区快照: ${backupName}`);
  console.log(`[safe-commit] 原始改动文件数: ${meta.changedPaths.length}`);
  console.log(`[safe-commit] 如需恢复暂存区，可参考:`);
  console.log(`git apply --index ${join(backupDir, "staged.patch")}`);
  console.log(`git apply ${join(backupDir, "working.patch")}`);
}

main().catch(error => {
  console.error(`[safe-commit] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
