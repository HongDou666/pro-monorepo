<script setup lang="ts">
import type { MenuProps } from "ant-design-vue";

// 当前路由
const route = useRoute();
const router = useRouter();

// 菜单项
const menuItems = [
  { key: "/", label: "首页" },
  { key: "/micro-app", label: "微前端应用" }
];

// 当前选中的菜单 - 使用 ref 避免初始化闪烁
const selectedKeys = ref<string[]>([]);

// 监听路由变化，更新选中菜单
watch(
  () => route.path,
  path => {
    selectedKeys.value = [path];
  },
  { immediate: true }
);

// 路由跳转
const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
  router.push(key as string);
};
</script>

<template>
  <a-layout class="app-layout">
    <!-- 顶部导航 -->
    <a-layout-header class="app-header">
      <div class="app-header__left">
        <div class="app-header__logo" @click="router.push('/')">
          <svg class="app-header__logo-icon" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span class="app-header__logo-text">Pro Monorepo</span>
        </div>
      </div>
      <div class="app-header__center">
        <a-menu
          v-model:selected-keys="selectedKeys"
          mode="horizontal"
          class="app-header__menu"
          @click="handleMenuClick"
        >
          <a-menu-item v-for="item in menuItems" :key="item.key">
            <span>{{ item.label }}</span>
          </a-menu-item>
        </a-menu>
      </div>
      <div class="app-header__right">
        <a-space>
          <a-button type="text" class="app-header__btn" title="语言切换">
            <template #icon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <path
                  d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                />
              </svg>
            </template>
          </a-button>
          <a-button type="text" class="app-header__btn" title="设置">
            <template #icon>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3" />
                <path
                  d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                />
              </svg>
            </template>
          </a-button>
        </a-space>
      </div>
    </a-layout-header>

    <!-- 内容区域 -->
    <a-layout-content class="app-content">
      <router-view />
    </a-layout-content>

    <!-- 底部 -->
    <a-layout-footer class="app-footer"> Pro Monorepo ©2024 - Powered by Vue 3 + TypeScript </a-layout-footer>
  </a-layout>
</template>

<style scoped lang="less">
.app-layout {
  min-height: 100vh;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;

  &__left {
    display: flex;
    align-items: center;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1e1b4b;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }

    &-icon {
      color: #6366f1;
    }

    &-text {
      font-size: 18px;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  &__center {
    display: flex;
    margin-left: 24px;
    flex: auto;
  }

  &__menu {
    border-bottom: none !important;
    background: transparent !important;
    line-height: 62px;

    :deep(.ant-menu-item) {
      margin: 0 4px !important;
      padding: 0 16px !important;
      border-radius: 6px !important;
      color: #4b5563;
      font-weight: 500;
      transition: all 0.2s ease;

      &::after {
        display: none !important;
      }

      &:hover {
        color: #6366f1;
        background: #f5f3ff;
      }
    }

    :deep(.ant-menu-item-selected) {
      color: #fff;
      background: #6366f1;

      &:hover {
        color: #fff;
        background: #6366f1;
      }
    }
  }

  &__right {
    display: flex;
    align-items: center;
  }

  &__btn {
    color: #6b7280;
    border-radius: 6px;
    transition: all 0.2s ease;

    &:hover {
      color: #6366f1;
      background: #f5f3ff;
    }
  }
}

.app-content {
  background: #f9fafb;
}

.app-footer {
  text-align: center;
  background: #f9fafb;
  color: #9ca3af;
  font-size: 14px;
  border-top: 1px solid #e5e7eb;
}
</style>
