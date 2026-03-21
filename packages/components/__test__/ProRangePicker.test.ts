import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { ProRangePicker } from "../src/ProRangePicker";

describe("ProRangePicker", () => {
  it("应该正确渲染组件", () => {
    const screen = render(ProRangePicker);

    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该渲染为范围选择器", () => {
    const screen = render(ProRangePicker);

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

    expect(startInput).toBeTruthy();
    expect(endInput).toBeTruthy();
  });

  it("应该支持禁用状态", () => {
    const screen = render(ProRangePicker, {
      props: {
        disabled: true
      }
    });

    const picker = screen.container.querySelector(".ant-picker");

    expect(picker?.classList.contains("ant-picker-disabled")).toBe(true);
  });

  it("应该支持自定义日期格式", () => {
    const screen = render(ProRangePicker, {
      props: {
        format: "YYYY/MM/DD"
      }
    });

    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该支持默认值", () => {
    const screen = render(ProRangePicker, {
      props: {
        modelValue: ["2026-03-01", "2026-03-10"]
      }
    });

    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });

  it("应该正确设置 dayRange 限制", () => {
    const screen = render(ProRangePicker, {
      props: {
        dayRange: 7
      }
    });

    const picker = screen.container.querySelector(".ant-picker");

    expect(picker).toBeTruthy();
  });
});
