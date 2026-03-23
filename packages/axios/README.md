# @pro-monorepo/axios

基于 axios 的公共请求包，面向主应用与微前端子应用统一复用。

## 特性

- 统一创建请求实例，避免主应用和子应用重复封装
- 支持并发请求限制，适合接口风暴、批量拉取等场景
- 支持取消全部未完成请求，适合路由切换、页面卸载或业务重置
- 支持失败重试，适合弱网或临时性 5xx 错误恢复
- 支持请求缓存，适合列表、详情、字典数据等可短时间复用的数据

## 安装与引入

当前包已作为 workspace package 接入 monorepo，应用内直接安装 workspace 依赖即可：

```json
{
  "dependencies": {
    "@pro-monorepo/axios": "workspace:*"
  }
}
```

```ts
import { createHttpClient } from "@pro-monorepo/axios";
```

## 快速开始

```ts
import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";

export const http = createHttpClient({
  axiosConfig: {
    baseURL: "/api",
    timeout: 10_000
  },
  concurrency: {
    maxConcurrent: 4
  },
  retry: {
    retries: 2,
    retryDelay: attempt => attempt.attempt * 300
  },
  cache: {
    enabled: true,
    ttl: 15_000
  }
});

setupHttpInterceptors(http, {
  getToken: () => localStorage.getItem("pro-monorepo:access-token"),
  showError: message => {
    console.error(message);
  }
});
```

## API 说明

### createHttpClient

创建一个独立请求实例。适合每个应用按自己的 baseURL、headers、重试策略单独配置。

```ts
const http = createHttpClient({
  axiosConfig: {
    baseURL: "/api"
  }
});
```

#### axiosConfig

透传给 axios.create 的原始配置，例如：

- baseURL
- timeout
- headers
- withCredentials
- adapter

#### concurrency

控制并发请求数量。

```ts
concurrency: {
  enabled: true,
  maxConcurrent: 4
}
```

- enabled: 是否开启并发控制，默认 true
- maxConcurrent: 允许同时发出的最大请求数，默认不限制

#### retry

失败重试配置。

```ts
retry: {
  retries: 2,
  retryDelay: ({ attempt }) => attempt * 300,
  retryMethods: ["get", "head", "options"],
  shouldRetry: ({ error }) => !error.response || error.response.status >= 500
}
```

- retries: 最大重试次数，默认 0
- retryDelay: 每次重试前等待时间，支持数字或函数
- retryMethods: 允许重试的请求方法，默认 get/head/options
- shouldRetry: 自定义重试条件；未配置时默认重试网络错误、408、429、5xx

#### cache

请求缓存配置。

```ts
cache: {
  enabled: true,
  ttl: 10_000,
  methods: ["get", "head"]
}
```

- enabled: 是否启用缓存，默认 false
- ttl: 缓存时长，单位毫秒，默认 10000
- methods: 允许缓存的请求方法，默认 get/head
- store: 自定义缓存容器；未配置时使用内存缓存
- generateKey: 自定义缓存 key 生成规则

## 实例方法

### request / get / post / put / patch / delete

统一的请求方法，返回 axios 标准响应结构。

```ts
const response = await http.get<UserDTO>("/users/1");
console.log(response.data);
```

### cancelAllRequests

取消当前实例下所有未完成请求。

```ts
http.cancelAllRequests("route leave");
```

适用场景：

- 页面卸载
- 路由离开
- 查询条件切换后放弃旧请求
- 用户主动点击“停止加载”

### clearCache / deleteCache / getCacheKeys

缓存管理方法。

```ts
http.clearCache();
http.deleteCache("custom-cache-key");
console.log(http.getCacheKeys());
```

如果 deleteCache 传入的是一个请求配置对象，则会按当前缓存 key 规则计算并删除对应缓存。

## 拦截器工具

### setupHttpInterceptors

用于给请求实例统一挂载 token、业务码判断和错误提示逻辑。

```ts
import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";

const http = createHttpClient();

setupHttpInterceptors(http, {
  getToken: () => localStorage.getItem("pro-monorepo:access-token"),
  showError: message => messageApi.error(message),
  onUnauthorized: () => {
    localStorage.removeItem("pro-monorepo:access-token");
  }
});
```

- 默认会把 token 注入 `Authorization: Bearer <token>`
- 默认会识别常见业务包结构：`{ code, success, message, data }`
- 默认成功码为 `0` / `200`
- 默认未登录码为 `401`
- 默认会把业务响应中的 `data` 自动解包到 `response.data`

如果某个请求不希望参与统一拦截逻辑，可以通过 `interceptorOptions` 覆盖：

```ts
await http.get("/raw-response", {
  interceptorOptions: {
    skipAuth: true,
    skipBusinessCheck: true,
    skipErrorToast: true,
    unwrapBusinessData: false
  }
});
```

## 单次请求覆盖全局配置

业务上常见的需求是“默认启用，但某一个请求例外”，可以通过 runtimeOptions 覆盖：

```ts
await http.get("/users", {
  runtimeOptions: {
    retry: false,
    cache: false,
    concurrency: false
  }
});
```

也支持局部覆盖参数：

```ts
await http.get("/dict", {
  runtimeOptions: {
    cache: {
      ttl: 60_000
    }
  }
});
```

## 主应用示例

```ts
import { createHttpClient } from "@pro-monorepo/axios";

export const mainApi = createHttpClient({
  axiosConfig: {
    baseURL: import.meta.env.VITE_API_BASE_URL
  },
  concurrency: {
    maxConcurrent: 6
  },
  retry: {
    retries: 2
  }
});
```

## 子应用示例

```ts
import { createHttpClient } from "@pro-monorepo/axios";

export const subAppApi = createHttpClient({
  axiosConfig: {
    baseURL: "/sub-api",
    headers: {
      "x-micro-app": "vite-vue"
    }
  },
  cache: {
    enabled: true,
    ttl: 5_000
  }
});
```

## 设计建议

- 推荐优先通过 `setupHttpInterceptors` 统一收敛 token、业务码判断和错误提示，再把业务特殊规则作为回调覆盖
- 对于会产生副作用的请求，例如创建、更新、删除，默认不要开启缓存
- 失败重试建议只用于幂等请求；如果必须重试 POST，请先确认服务端具备幂等保障
- 如果页面切换频繁，建议在路由离开钩子里调用 cancelAllRequests
