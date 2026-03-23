/**
 * 简单的并发调度器。
 * 目标不是覆盖所有队列策略，而是提供一个可预测、可取消的 FIFO 并发限制。
 */
interface QueueTask {
  readonly resolve: () => void;
  readonly reject: (error: Error) => void;
  readonly signal: AbortSignal;
  readonly onAbort: () => void;
}

export class RequestConcurrencyController {
  private activeCount = 0;
  private readonly queue: QueueTask[] = [];
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  async acquire(signal: AbortSignal) {
    if (signal.aborted) {
      throw new Error(getAbortReason(signal));
    }

    if (this.activeCount < this.maxConcurrent) {
      this.activeCount += 1;

      return;
    }

    await new Promise<void>((resolve, reject) => {
      const onAbort = () => {
        this.removeTask(task);
        reject(new Error(getAbortReason(signal)));
      };

      const task: QueueTask = {
        resolve: () => {
          signal.removeEventListener("abort", onAbort);
          this.activeCount += 1;
          resolve();
        },
        reject: error => {
          signal.removeEventListener("abort", onAbort);
          reject(error);
        },
        signal,
        onAbort
      };

      signal.addEventListener("abort", onAbort, { once: true });
      this.queue.push(task);
    });
  }

  release() {
    if (this.activeCount > 0) {
      this.activeCount -= 1;
    }

    this.drainQueue();
  }

  cancelPending(reason = "All pending requests have been canceled") {
    while (this.queue.length > 0) {
      const task = this.queue.shift();

      task?.reject(new Error(reason));
    }
  }

  getPendingCount() {
    return this.activeCount + this.queue.length;
  }

  private drainQueue() {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();

      if (!task) {
        return;
      }

      if (task.signal.aborted) {
        task.reject(new Error(getAbortReason(task.signal)));
        continue;
      }

      task.resolve();
    }
  }

  private removeTask(target: QueueTask) {
    const index = this.queue.indexOf(target);

    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }
}

function getAbortReason(signal: AbortSignal) {
  return typeof signal.reason === "string" ? signal.reason : "Request aborted";
}
