import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { ProInputStorage } from "../src/ProInputStorage";

describe("ProInputStorage", () => {
  it("应该正确渲染组件", () => {
    const screen = render(ProInputStorage);

    // 使用 container.querySelector 查询元素
    const input = screen.container.querySelector('input[placeholder="请输入键名"]');

    expect(input).toBeTruthy();
  });

  it("在存储模式下应该显示两个输入框", () => {
    const screen = render(ProInputStorage);

    const keyInput = screen.container.querySelector(".pro-input-storage__key input");
    const valueInput = screen.container.querySelector(".pro-input-storage__value input");

    expect(keyInput).toBeTruthy();
    expect(valueInput).toBeTruthy();
  });

  it("应该显示存储按钮", () => {
    const screen = render(ProInputStorage);

    const button = screen.container.querySelector(".ant-btn-primary");

    expect(button).toBeTruthy();
  });

  it("应该显示模式切换按钮", () => {
    const screen = render(ProInputStorage);

    // Radio 按钮包含"存储"和"删除"文字
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

    // showModeSwitch=false 时不显示 Radio.Group
    const radioGroup = screen.container.querySelector(".ant-radio-group");

    expect(radioGroup).toBeNull();

    // 但按钮仍然存在
    const button = screen.container.querySelector(".ant-btn-primary");

    expect(button).toBeTruthy();
  });
});
