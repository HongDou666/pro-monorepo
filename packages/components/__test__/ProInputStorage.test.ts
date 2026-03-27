import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { ProInputStorage } from "../src/ProInputStorage";

/**
 * ProInputStorage 测试重点：
 * 1. 基础渲染是否完整。
 * 2. 不同 props 是否正确影响输入区和模式切换展示。
 * 3. 组件最小交互骨架是否存在，避免样式或结构调整时破坏使用方式。
 */
describe("ProInputStorage", () => {
  it("应该正确渲染组件", () => {
    const screen = render(ProInputStorage);

    // 只要键名输入框存在，就说明组件的最基础操作入口已经可见。
    const input = screen.container.querySelector('input[placeholder="请输入键名"]');

    expect(input).toBeTruthy();
  });

  it("在存储模式下应该显示两个输入框", () => {
    const screen = render(ProInputStorage);

    // set 模式需要同时输入 key 和 value，这是组件的默认主场景。
    const keyInput = screen.container.querySelector(".pro-input-storage__key input");
    const valueInput = screen.container.querySelector(".pro-input-storage__value input");

    expect(keyInput).toBeTruthy();
    expect(valueInput).toBeTruthy();
  });

  it("应该显示存储按钮", () => {
    const screen = render(ProInputStorage);

    // 主按钮存在，说明用户可以从默认模式直接执行动作。
    const button = screen.container.querySelector(".ant-btn-primary");

    expect(button).toBeTruthy();
  });

  it("应该显示模式切换按钮", () => {
    const screen = render(ProInputStorage);

    // Radio 按钮包含“存储”和“删除”，说明两种行为模式都被正确暴露。
    const storageRadio = screen.container.textContent?.includes("存储");
    const deleteRadio = screen.container.textContent?.includes("删除");

    expect(storageRadio).toBe(true);
    expect(deleteRadio).toBe(true);
  });

  it("应该支持自定义占位符", () => {
    const screen = render(ProInputStorage, {
      props: {
        keyPlaceholder: "自定义键名",
        valuePlaceholder: "自定义值"
      }
    });

    // 自定义占位符是这个组件最常见的业务个性化入口之一。
    const keyInput = screen.container.querySelector('input[placeholder="自定义键名"]');
    const valueInput = screen.container.querySelector('input[placeholder="自定义值"]');

    expect(keyInput).toBeTruthy();
    expect(valueInput).toBeTruthy();
  });

  it("应该支持隐藏模式切换", () => {
    const screen = render(ProInputStorage, {
      props: {
        showModeSwitch: false
      }
    });

    // showModeSwitch=false 时，组件应退化成固定模式的小工具，不再展示切换 UI。
    const radioGroup = screen.container.querySelector(".ant-radio-group");

    expect(radioGroup).toBeNull();

    // 即便隐藏模式切换，主操作按钮仍必须存在，否则组件失去可用性。
    const button = screen.container.querySelector(".ant-btn-primary");

    expect(button).toBeTruthy();
  });
});
