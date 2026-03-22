import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const repoRoot = process.cwd();

function runGit(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options
  });

  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args.join(" ")} failed`);
  }

  return result.stdout;
}

function getChangedPaths() {
  const groups = [
    runGit(["diff", "--name-only"]),
    runGit(["diff", "--cached", "--name-only"]),
    runGit(["ls-files", "--others", "--exclude-standard"])
  ];

  return [
    ...new Set(
      groups.flatMap(output =>
        output
          .split("\n")
          .map(item => item.trim())
          .filter(Boolean)
      )
    )
  ].sort();
}

async function copySnapshotFiles(backupDir, changedPaths) {
  for (const relativePath of changedPaths) {
    const sourcePath = resolve(repoRoot, relativePath);
    const targetPath = resolve(backupDir, "snapshot", relativePath);
    const targetDir = dirname(targetPath);

    await mkdir(targetDir, { recursive: true });

    try {
      await copyFile(sourcePath, targetPath);
    } catch {
      // 文件可能已被删除，这种情况由 diff/metadata 负责记录。
    }
  }
}

function createBackupName() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function createBackup() {
  const gitDir = runGit(["rev-parse", "--git-dir"]).trim();
  const backupRoot = resolve(repoRoot, gitDir, ".safe-commit-backups");
  const backupName = createBackupName();
  const backupDir = join(backupRoot, backupName);
  const changedPaths = getChangedPaths();

  await mkdir(backupDir, { recursive: true });

  const [workingDiff, stagedDiff, statusOutput, headSha] = [
    runGit(["diff", "--binary", "--no-ext-diff"]),
    runGit(["diff", "--cached", "--binary", "--no-ext-diff"]),
    runGit(["status", "--short"]),
    runGit(["rev-parse", "--verify", "HEAD"])
  ];

  await Promise.all([
    writeFile(join(backupDir, "working.patch"), workingDiff, "utf8"),
    writeFile(join(backupDir, "staged.patch"), stagedDiff, "utf8"),
    writeFile(
      join(backupDir, "meta.json"),
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          repoRoot,
          headSha: headSha.trim(),
          changedPaths,
          gitStatus: statusOutput
        },
        null,
        2
      ),
      "utf8"
    )
  ]);

  await copySnapshotFiles(backupDir, changedPaths);

  return { backupDir, backupName };
}

function runCommitizen() {
  if (process.env.SAFE_COMMIT_TEST_MODE === "fail") {
    return Promise.resolve(1);
  }

  return new Promise(resolveExitCode => {
    const child = spawn("pnpm", ["exec", "git-cz"], {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    });

    child.on("exit", code => {
      resolveExitCode(code ?? 1);
    });
  });
}

async function main() {
  const { backupDir, backupName } = await createBackup();

  console.log(`[safe-commit] 已创建改动备份: ${backupName}`);
  console.log(`[safe-commit] 备份位置: ${backupDir}`);

  const exitCode = await runCommitizen();

  if (exitCode === 0) {
    await rm(backupDir, { recursive: true, force: true });
    process.exit(0);
  }

  console.error("[safe-commit] 提交未完成，已保留本次改动备份。");
  console.error(`[safe-commit] 可执行: pnpm commit:restore ${backupName}`);
  process.exit(exitCode);
}

main().catch(error => {
  console.error(`[safe-commit] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
