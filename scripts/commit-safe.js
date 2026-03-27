import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

// 该脚本用于“安全提交”：在进入交互式 commitizen 之前先备份当前工作区改动。
const repoRoot = process.cwd();

function runGit(args, options = {}) {
  // 统一通过同步 git 命令获取瞬时状态，避免备份过程中状态被异步打乱。
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
  // 同时覆盖未暂存、已暂存和未跟踪文件，尽可能完整保存当前工作区现场。
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
      // 文件可能已被删除；此时 patch 和 meta 已足够恢复，不必让备份流程失败。
    }
  }
}

function createBackupName() {
  // 直接使用 ISO 时间戳，既保证有序，也方便人工定位某次提交尝试。
  return new Date().toISOString().replace(/[:.]/g, "-");
}

async function createBackup() {
  const gitDir = runGit(["rev-parse", "--git-dir"]).trim();
  const backupRoot = resolve(repoRoot, gitDir, ".safe-commit-backups");
  const backupName = createBackupName();
  const backupDir = join(backupRoot, backupName);
  const changedPaths = getChangedPaths();

  await mkdir(backupDir, { recursive: true });

  // 同时保存工作区 patch、暂存区 patch、状态元信息和文件快照，最大化恢复成功率。
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
    // 这里保留交互式 stdio，让开发者仍然使用熟悉的 commitizen 体验。
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
    // 提交成功后立即删除备份，避免 .git 内部长期堆积无效快照。
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
