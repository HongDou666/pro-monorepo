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

/**
 * 请求并发控制器。
 *
 * 它只关注“是否允许发起下一条请求”这一个职责，
 * 不负责请求执行本身，因此可以被上层请求库轻量复用。
 */
export class RequestConcurrencyController {
  private activeCount = 0;
  private readonly queue: QueueTask[] = [];
  private readonly maxConcurrent: number;

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * 申请一个并发槽位。
   *
   * - 如果还有空闲槽位，立即放行。
   * - 如果已达上限，则进入等待队列。
   * - 如果等待期间 signal 被取消，则从队列移除并抛错。
   */
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

      // 这里保存的是“拿到槽位后如何继续执行”的回调，而不是实际请求任务本身。
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

      // FIFO 入队，保证先等待的请求先获得执行机会。
      this.queue.push(task);
    });
  }

  /**
   * 释放一个并发槽位，并尝试唤醒队列中的下一个请求。
   */
  release() {
    if (this.activeCount > 0) {
      this.activeCount -= 1;
    }

    this.drainQueue();
  }

  /**
   * 取消所有尚未开始执行的排队请求。
   *
   * 已经占用槽位并发出的请求不在这里处理，由上层 AbortController 负责取消。
   */
  cancelPending(reason = "All pending requests have been canceled") {
    while (this.queue.length > 0) {
      const task = this.queue.shift();

      task?.reject(new Error(reason));
    }
  }

  getPendingCount() {
    return this.activeCount + this.queue.length;
  }

  /**
   * 尝试按 FIFO 顺序消化等待队列。
   */
  private drainQueue() {
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      const task = this.queue.shift();

      if (!task) {
        return;
      }

      if (task.signal.aborted) {
        // 如果任务在排队期间已取消，则直接跳过并处理下一项。
        task.reject(new Error(getAbortReason(task.signal)));
        continue;
      }

      task.resolve();
    }
  }

  // 等待中的任务取消时，需要把它从队列中移除，避免后续被错误唤醒。
  private removeTask(target: QueueTask) {
    const index = this.queue.indexOf(target);

    if (index >= 0) {
      this.queue.splice(index, 1);
    }
  }
}

// AbortSignal.reason 可能不是字符串，这里统一兜底成可读错误消息。
function getAbortReason(signal: AbortSignal) {
  return typeof signal.reason === "string" ? signal.reason : "Request aborted";
}
