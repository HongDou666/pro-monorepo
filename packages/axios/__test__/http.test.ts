import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHttpClient, setupHttpInterceptors } from "../src";

/**
 * 请求库回归测试。
 *
 * 覆盖重点：
 * 1. 并发限制是否生效。
 * 2. 批量取消、失败重试和缓存是否按预期工作。
 * 3. 拦截器是否能处理 token、业务错误和自动解包。
 */
describe("@pro-monorepo/axios", () => {
  beforeEach(() => {
    // 某些测试会用到异步调度，统一恢复真实计时器避免相互污染。
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("应该限制请求并发数", async () => {
    let activeCount = 0;
    let maxActiveCount = 0;
    const resolvers: Array<(value: AxiosResponse) => void> = [];

    // 用可控 adapter 模拟“请求完成时机”，从而验证并发队列是否真的只放行两条请求。
    const adapter: AxiosAdapter = config => {
      activeCount += 1;
      maxActiveCount = Math.max(maxActiveCount, activeCount);

      return new Promise(resolve => {
        resolvers.push(() => {
          activeCount -= 1;
          resolve(createResponse(config, { ok: true }));
        });
      });
    };

    const client = createHttpClient({
      axiosConfig: { adapter },
      concurrency: {
        maxConcurrent: 2
      }
    });

    const task1 = client.get("/task-1");
    const task2 = client.get("/task-2");
    const task3 = client.get("/task-3");

    // 前两条应立即执行，第三条应进入等待队列。
    await flushPromises();
    expect(maxActiveCount).toBe(2);
    expect(client.getPendingCount()).toBe(3);

    resolvers[0]?.(createResponse({ url: "/task-1" }, { ok: true }));
    await flushPromises();
    expect(maxActiveCount).toBe(2);

    resolvers[1]?.(createResponse({ url: "/task-2" }, { ok: true }));
    resolvers[2]?.(createResponse({ url: "/task-3" }, { ok: true }));

    await Promise.all([task1, task2, task3]);
  });

  it("应该能够取消所有未完成请求", async () => {
    // adapter 同时监听 abort 事件，模拟真实 axios 在 signal 取消时的拒绝行为。
    const adapter: AxiosAdapter = config => {
      return new Promise((resolve, reject) => {
        if (config.signal && typeof config.signal.addEventListener === "function") {
          config.signal.addEventListener(
            "abort",
            () => {
              reject(new AxiosError("canceled", AxiosError.ERR_CANCELED, config));
            },
            { once: true }
          );
        }

        setTimeout(() => resolve(createResponse(config, { ok: true })), 100);
      });
    };

    const client = createHttpClient({
      axiosConfig: { adapter },
      concurrency: {
        maxConcurrent: 1
      }
    });

    const requestA = client.get("/slow-a");
    const requestB = client.get("/slow-b");

    await flushPromises();
    client.cancelAllRequests("manual-cancel");

    await expect(requestA).rejects.toMatchObject({ code: AxiosError.ERR_CANCELED });
    await expect(requestB).rejects.toThrow("manual-cancel");
    expect(client.getPendingCount()).toBe(0);
  });

  it("请求失败后应该按配置重试", async () => {
    let count = 0;

    // 前两次故意失败，第三次成功，用于验证 retry 次数和 delay 流程。
    const adapter: AxiosAdapter = config => {
      count += 1;
      if (count < 3) {
        return Promise.reject(new AxiosError("network error", AxiosError.ERR_NETWORK, config));
      }

      return Promise.resolve(createResponse(config, { retry: count }));
    };

    const client = createHttpClient({
      axiosConfig: { adapter },
      retry: {
        retries: 2,
        retryDelay: 1
      }
    });

    const response = await client.get<{ retry: number }>("/retry");

    expect(response.data.retry).toBe(3);
    expect(count).toBe(3);
  });

  it("应该命中缓存并减少重复请求", async () => {
    let count = 0;

    // 同一个请求签名连续调用两次，第二次应直接命中缓存而不是再次走 adapter。
    const adapter: AxiosAdapter = config => {
      count += 1;

      return Promise.resolve(createResponse(config, { count }));
    };

    const client = createHttpClient({
      axiosConfig: { adapter },
      cache: {
        enabled: true,
        ttl: 1_000
      }
    });

    const first = await client.get<{ count: number }>("/cache", { params: { page: 1 } });
    const second = await client.get<{ count: number }>("/cache", { params: { page: 1 } });

    expect(first.data.count).toBe(1);
    expect(second.data.count).toBe(1);
    expect(count).toBe(1);
    expect(client.getCacheKeys()).toHaveLength(1);
  });

  it("可以按请求覆盖全局能力开关", async () => {
    let count = 0;

    // 这个用例同时验证：关闭 retry 后失败不再补偿，关闭 cache 后每次都直连。
    const adapter: AxiosAdapter = config => {
      count += 1;
      if (count === 1) {
        return Promise.reject(new AxiosError("network error", AxiosError.ERR_NETWORK, config));
      }

      return Promise.resolve(createResponse(config, { count }));
    };

    const client = createHttpClient({
      axiosConfig: { adapter },
      retry: {
        retries: 2,
        retryDelay: 1
      },
      cache: {
        enabled: true,
        ttl: 1_000
      }
    });

    await expect(
      client.get("/no-retry", {
        runtimeOptions: {
          retry: false
        }
      })
    ).rejects.toBeInstanceOf(AxiosError);

    const responseA = await client.get<{ count: number }>("/no-cache", {
      runtimeOptions: {
        cache: false
      }
    });
    const responseB = await client.get<{ count: number }>("/no-cache", {
      runtimeOptions: {
        cache: false
      }
    });

    expect(responseA.data.count).toBe(2);
    expect(responseB.data.count).toBe(3);
  });

  it("应该通过请求拦截器自动附带 token", async () => {
    let authorization = "";

    // 直接读取 adapter 收到的 Authorization 头，验证请求拦截器注入是否成功。
    const adapter: AxiosAdapter = config => {
      authorization = String(config.headers?.Authorization ?? "");

      return Promise.resolve(createResponse(config, { ok: true }));
    };

    const client = createHttpClient({
      axiosConfig: { adapter }
    });

    setupHttpInterceptors(client, {
      getToken: () => "demo-token"
    });

    await client.get("/auth");
    expect(authorization).toBe("Bearer demo-token");
  });

  it("应该通过响应拦截器识别业务码并提示错误", async () => {
    const showError = vi.fn();

    // HTTP 层成功，但业务码失败，应该抛出业务错误而不是普通网络错误。
    const adapter: AxiosAdapter = config => {
      return Promise.resolve(
        createResponse(config, {
          code: 500,
          message: "业务执行失败",
          data: null
        })
      );
    };

    const client = createHttpClient({
      axiosConfig: { adapter }
    });

    setupHttpInterceptors(client, {
      showError
    });

    await expect(client.get("/business-error")).rejects.toMatchObject({
      name: "ProAxiosBusinessError",
      code: 500,
      isBusinessError: true
    });
    expect(showError).toHaveBeenCalledWith(
      "业务执行失败",
      expect.objectContaining({
        type: "business"
      })
    );
  });

  it("应该通过响应拦截器自动解包业务数据", async () => {
    // 默认成功响应会把 payload.data 自动解包到 response.data，减少业务层重复访问 data.data。
    const adapter: AxiosAdapter = config => {
      return Promise.resolve(
        createResponse(config, {
          code: 0,
          message: "ok",
          data: {
            name: "axios"
          }
        })
      );
      // 构造一个最小可用的 axios 响应对象，供自定义 adapter 测试复用。
    };

    const client = createHttpClient({
      axiosConfig: { adapter }
    });

    setupHttpInterceptors(client);

    const response = await client.get<{ name: string }>("/unwrap");

    expect(response.data.name).toBe("axios");
  });
});

function createResponse<T = unknown>(config: Partial<InternalAxiosRequestConfig>, data: T): AxiosResponse<T> {
  const normalizedConfig: InternalAxiosRequestConfig = {
    headers: new AxiosHeaders(),
    method: "get",
    ...config
  };

  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: normalizedConfig
  };
}

// 等待当前微任务和一轮定时器调度完成，便于观察并发队列状态变化。
function flushPromises() {
  return new Promise(resolve => setTimeout(resolve, 0));
}
