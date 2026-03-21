<script setup lang="ts">
import viteLogo from "@/assets/vite.svg";
import heroImg from "@/assets/hero.png";
import vueLogo from "@/assets/vue.svg";
import { message } from "ant-design-vue";

const success = () => {
  message.success("This is a success message");
};
const error = () => {
  message.error("This is an error message");
};
const warning = () => {
  message.warning("This is a warning message");
};

const count = ref(0);
</script>

<template>
  <a-space>
    <a-button @click="success">Success</a-button>
    <a-button @click="error">Error</a-button>
    <a-button @click="warning">Warning</a-button>
  </a-space>
  <section id="center">
    <div class="hero">
      <img :src="heroImg" class="base" width="170" height="179" alt="" />
      <img :src="vueLogo" class="framework" alt="Vue logo" />
      <img :src="viteLogo" class="vite" alt="Vite logo" />
    </div>
    <div>
      <h1>Get started</h1>
      <p>Edit <code>src/App.vue</code> and save to test <code>HMR</code></p>
    </div>
    <button class="counter" @click="count++">Count is {{ count }}</button>
  </section>

  <div class="ticks"></div>

  <section id="next-steps">
    <div id="docs">
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#documentation-icon"></use>
      </svg>
      <h2>Documentation</h2>
      <p>Your questions, answered</p>
      <ul>
        <li>
          <a href="https://vite.dev/" target="_blank">
            <img class="logo" :src="viteLogo" alt="" />
            Explore Vite
          </a>
        </li>
        <li>
          <a href="https://vuejs.org/" target="_blank">
            <img class="button-icon" :src="vueLogo" alt="" />
            Learn more
          </a>
        </li>
      </ul>
    </div>
    <div id="social">
      <svg class="icon" role="presentation" aria-hidden="true">
        <use href="/icons.svg#social-icon"></use>
      </svg>
      <h2>Connect with us</h2>
      <p>Join the Vite community</p>
      <ul>
        <li>
          <a href="https://github.com/vitejs/vite" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#github-icon"></use>
            </svg>
            GitHub
          </a>
        </li>
        <li>
          <a href="https://chat.vite.dev/" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#discord-icon"></use>
            </svg>
            Discord
          </a>
        </li>
        <li>
          <a href="https://x.com/vite_js" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#x-icon"></use>
            </svg>
            X.com
          </a>
        </li>
        <li>
          <a href="https://bsky.app/profile/vite.dev" target="_blank">
            <svg class="button-icon" role="presentation" aria-hidden="true">
              <use href="/icons.svg#bluesky-icon"></use>
            </svg>
            Bluesky
          </a>
        </li>
      </ul>
    </div>
  </section>

  <div class="ticks"></div>
  <section id="spacer"></section>
</template>

<style scoped lang="less">
.hello {
  width: 100%;
  .mode {
    color: #f50;
  }
}
:deep(.hello) {
  width: 100%;
}
</style>

<!-- 1. Less 变量 与 混合 -->
<style scoped lang="less">
@import url("@/components/index.less");

@bgColor: #ff6f61;
@height: 100px;
@width: @height + 200px;
@size: 20px * 1.2;
@fontSize: "size";
@cl: rgb(218, 105, 0);
@color: "cl";
@base-color: #999;

/* 1.1. 普通混合 */
.bordered {
  border: solid 5px #f40;
  border-radius: 20%;
}

/* 1.2. 带参数的混合 */
.mixins_font(@s:30px,@w:400) {
  font-size: @s;
  font-weight: @w;
}

/* 3. less混合的可变参数 */
.animate(@name,@time,...) {
  transition: @arguments;
}

.less_comp_div {
  display: flex;
  justify-content: center;
  align-items: center;
  width: @width;
  height: @height;
  font-size: @@fontSize;
  color: @base-color / 3;
  background-color: @bgColor;
  .bordered();
}

.less_comp_p {
  color: @@color;
  .mixins_font(@w:900);
  .animate(all,4s,linear,0s);
}
</style>

<!-- 2. less中混合的匹配模式 -->
<style scoped lang="less">
/* 2.1
  less中混合通用匹配模式
  @_：通用匹配模式，无论同名的哪一个混合被匹配了，都会先执行通用匹配模式中的代码
*/
.triangle(@_,@weight: 400,@size: 12px) {
  font-weight: @weight;
  font-size: @size;
  font-style: italic;
}

.triangle(Sm, @weight: 500, @size) {
  font-weight: @weight;
  font-size: @size;
  color: #3ef15c;
}

.triangle(Xl, @weight : 700, @size) {
  font-weight: @weight;
  font-size: @size;
  color: #7768ff;
}

.triangle(Bg, @weight : 900, @size) {
  font-weight: @weight;
  font-size: @size;
  color: #44d6cf;
}

.less_comp_main {
  .triangle(Bg,@size: 30px);
}
</style>

<!-- 3. 算术运算符 +、-、*、/ 可以对任何数字、颜色或变量进行运算 -->
<style scoped lang="less">
@the-border: 20px;
@base-color: #333;

.box1 {
  font-size: 24px;
  color: @base-color * 3;
  border-width: @the-border - 10 (@the-border - 2) @the-border + 2 @the-border; // 10px 18px 22px 20px
}
</style>

<!-- 4. 转义（Escaping）允许你使用任意字符串作为属性或变量值 任何 ~"anything" 或 ~'anything' 形式的内容都将按原样输出，除非 interpolation -->
<style scoped lang="less">
@min768: ~"(min-width: 768px)";
@max480: ~"(max-width: 480px)";

.element {
  @media @min768 {
    font-size: 2rem;
  }

  @media @max480 {
    font-size: 1rem;
  }
}
</style>

<!-- 5. 函数（Functions） -->
<style scoped lang="less">
@width: 0.6;

.percentage {
  width: percentage(@width); // `60%`
}
</style>

<!-- 6. 映射（Maps） -->
<style scoped lang="less">
@var-primary: #ff1493;
@var-secondary: #00bcd4;
.colors() {
  primary: @var-primary;
  secondary: @var-secondary;
}

.maps {
  color: .colors[primary];
  border-color: .colors[secondary];
}
</style>

<!-- 7. 继承（extend）使用变量来构建样式规则 -->
<style scoped lang="less">
@class-center: center;
// .center {
.@{class-center} {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #fff;
  transform: translate(-50%, -50%);
}

.father:extend(.center) {
  position: static;
  width: 200px;
  height: 100px;
  background: #47fff0;
  transform: translate(0%, 0%);
  .son:extend(.center) {
    width: 100px;
    height: 50px;
    background: #f28d35;
  }
}
</style>

<!-- 8. 条件判断 -->
<style scoped lang="less">
@class-wrap: demo_less;
@class-div: div;
@class-demo1: demo1;
@ant: a-1 a-2 a-3 a-4;

/*
  (),() 相等于js中的逻辑 ||
  ()and() 相等于js中的逻辑 &&
*/
.size(@width,@height) when (@width=100px),(@height=100px) {
  width: @width;
  height: @height;
  background: #2d66d1;
}

// 只有当 @fs 是像素单位时，这个混合内部的样式规则才会生效并被应用
.font(@fs,@len) when (ispixel(@fs))and(@len < length(@ant)) {
  font-size: @fs;
  color: #000;
}

.@{class-wrap} {
  padding: 20px;
  border: 1px solid #ccc;
  @{class-div} {
    font-style: italic;
  }
  .@{class-demo1} {
    .size(100px,80px);
    .font(30,2); // 不生效，因为不符合条件
    .font(30px,5); // 不生效，因为不符合条件

    color: #f40;
  }

  .demo2 {
    .size(90px,90px); // 不生效，因为不符合条件
    .font(30px,2);
  }
}
</style>

<!-- 9. extract函数用于从一个列表（用逗号或空格分隔的值的集合）中提取特定位置的元素 & 初始化 -->
<style scoped lang="less">
@button-colors: #ff0000, #00ff00, #0000ff; // 红色、绿色、蓝色

.init-zqc(@w: 100px, @h: 50px) {
  .btn_hover {
    width: @w;
    height: @h;
    border: 1px solid extract(@button-colors, 1);
    transition: all 0.5s;

    &:hover {
      color: extract(@button-colors, 2);
      background-color: extract(@button-colors, 3);
    }
  }
}

.init-zqc(200px,50px);
</style>

<!-- 10. 利用条件判断 生成Less循环 -->
<style scoped lang="less">
@i: 1;

/* 统一调整antdes UI 禁用状态下的样式 */
.init-ant-class() {
  // 定义一个列表 类似于数组
  @ant-form-classes: ant-input, ant-input-number, ant-select, ant-picker;
  // 调用.each混合来遍历列表中的每个元素，从1开始到列表长度
  .each(@ant-form-classes, @i);
}

/* 定义一个混合，用来遍历列表中的每个元素 */
.each(@list, @i) when (@i <= length(@list)) {
  .each-item(extract(@list, @i)); // 假设提取第@i项并处理
  .each(@list,@i + 1);
}

/* 定义一个处理每一项的混合 */
.each-item(@className) {
  .@{className}-disabled,
  .@{className}:not(.@{className}-customize-input) {
    color: #f40;
    background-color: #c6ba7e;
    border: 5px solid #ccccd4;
    :deep(.@{className}-input-wrap .@{className}-input) {
      color: #f40;
    }

    :deep(.ant-select-selector) {
      color: #f40;
    }
    :deep(.@{className}-input input) {
      color: #f40;
    }
  }
}

/* 调用混合 */
.init-ant-class();
</style>
