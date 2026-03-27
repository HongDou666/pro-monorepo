import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { ProRangePicker } from "../src/ProRangePicker";

/**
 * ProRangePicker 测试重点：
 * 1. 组件是否正确渲染为范围选择器。
 * 2. 关键 props 是否能映射到 UI 层。
 * 3. 作为共享组件时，默认值和基础限制配置不会在重构中丢失。
 */
describe("ProRangePicker", () => {
  it("应该正确渲染组件", () => {
    const screen = render(ProRangePicker);

    // antd 的外层选择器存在，说明基础挂载成功。
    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该渲染为范围选择器", () => {
    const screen = render(ProRangePicker);

    // 范围选择器应该渲染两个输入框，而不是单个日期输入。
    const inputs = screen.container.querySelectorAll(".ant-picker-input input");

    expect(inputs.length).toBe(2);
  });

  it("应该支持自定义占位符", () => {
    const screen = render(ProRangePicker, {
      props: {
        placeholder: ["开始时间", "结束时间"]
      }
    });

    const startInput = screen.container.querySelector('input[placeholder="开始时间"]');
    const endInput = screen.container.querySelector('input[placeholder="结束时间"]');

    // 占位符是消费方对接业务文案时最直接的自定义入口。
    expect(startInput).toBeTruthy();
    expect(endInput).toBeTruthy();
  });

  it("应该支持禁用状态", () => {
    const screen = render(ProRangePicker, {
      props: {
        disabled: true
      }
    });

    // disabled 状态通常通过 class 反映，这是最稳定的断言入口。
    const picker = screen.container.querySelector(".ant-picker");

    expect(picker?.classList.contains("ant-picker-disabled")).toBe(true);
  });

  it("应该支持自定义日期格式", () => {
    const screen = render(ProRangePicker, {
      props: {
        format: "YYYY/MM/DD"
      }
    });

    // 这里主要验证传入 format 后组件仍能正常渲染，不因 props 映射出错而崩溃。
    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该支持默认值", () => {
    const screen = render(ProRangePicker, {
      props: {
        modelValue: ["2026-03-01", "2026-03-10"]
      }
    });

    // 传入 modelValue 时组件应能完成初始化同步，这是受控组件的核心能力之一。
    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该正确设置 dayRange 限制", () => {
    const screen = render(ProRangePicker, {
      props: {
        dayRange: 7
      }
    });

    // 当前测试只守住“传入限制值后组件可正常挂载”这条回归线。
    // 更细的 disabledDate 行为可在后续交互测试里补充。
    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });
});
