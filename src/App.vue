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

// 当前选中的菜单
const selectedKeys = computed(() => [route.path]);

// 路由跳转
const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
  router.push(key as string);
};
</script>

<template>
  <a-layout class="app-layout">
    <!-- 顶部导航 -->
    <a-layout-header class="app-header">
      <div class="app-header__logo">Pro Monorepo</div>
      <a-menu
        v-model:selected-keys="selectedKeys"
        mode="horizontal"
        theme="dark"
        class="app-header__menu"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          <span>{{ item.label }}</span>
        </a-menu-item>
      </a-menu>
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
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: #001529;

  &__logo {
    color: #fff;
    font-size: 20px;
    font-weight: 600;
    margin-right: 32px;
    white-space: nowrap;
  }

  &__menu {
    flex: 1;
    border-bottom: none;
  }
}

.app-content {
  background: #f0f2f5;
}

.app-footer {
  text-align: center;
  background: #f0f2f5;
  color: #666;
}
</style>
