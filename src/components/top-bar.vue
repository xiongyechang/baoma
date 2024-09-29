<template>
  <div class="topbar" ref="topbar">
    <div class="topbar-logo">
      <span
        class="back-icon"
        :style="{
          width: showBackBtn ? `60px` : 0,
        }"
        @click="back"
      >
        <el-icon color="#fff" size="18"><ArrowLeftBold /></el-icon>
      </span>
      <img
        :style="logoMarginLeft"
        src="@/assets/logo.png"
        width="24"
        height="24"
      />
      <span class="app-name">{{ name }}@{{ version }}</span>
    </div>
    <div class="topbar-body">
      <span class="opt-minimize" @click.stop="minimize">
        <el-icon><SemiSelect /></el-icon>
      </span>
      <span class="opt-maximize" @click.stop="maximize">
        <el-icon><FullScreen /></el-icon>
      </span>
      <span class="opt-close" @click.stop="close">
        <el-icon><CloseBold /></el-icon>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { app, getCurrentWindow } from "@electron/remote";
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { WindowSize } from "@/constants/constants";
import {
  FullScreen,
  SemiSelect,
  CloseBold,
  ArrowLeftBold,
} from "@element-plus/icons-vue";

let currWindow: any = null;
let windowSize = ref(WindowSize.normal);

const name = app.getName();

const version = app.getVersion();

// 获取路由器实例
const router = useRouter();
// route是响应式对象,可监控器变化
const route = useRoute();

onMounted(() => {
  currWindow = getCurrentWindow(); // 当前窗口

  document.addEventListener("visibilitychange", () => {
    var isHidden = document.hidden;
    if (isHidden) {
      if (currWindow.isMinimized()) {
        windowSize.value = WindowSize.minimize;
      } else {
        windowSize.value = WindowSize.normal;
      }
    } else {
      if (currWindow.isMaximized()) {
        windowSize.value = WindowSize.maximize;
      } else {
        windowSize.value = WindowSize.normal;
      }
    }
  });
});

const showBackBtn = computed(() => route.path !== "/");

const logoMarginLeft = computed(() =>
  route.path === "/" ? { marginLeft: "10px" } : {}
);

const maximize = () => {
  if (currWindow.isMaximized()) {
    currWindow.unmaximize();
    windowSize.value = WindowSize.normal;
  } else {
    currWindow.maximize();
    windowSize.value = WindowSize.maximize;
  }
};

const minimize = () => {
  if (!currWindow.isMinimized()) {
    currWindow.minimize();
    windowSize.value = WindowSize.minimize;
  }
};

const close = () => {
  app.quit();
};

const back = () => {
  router.back();
};
</script>

<style lang="scss" scoped>
.topbar {
  height: 33px;
  background: var(--el-color-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  .topbar-logo {
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: flex-start;
    height: 33px;
    .app-name {
      display: inline-block;
      height: 33px;
      line-height: 33px;
      padding: 0 10px;
      text-align: center;
      color: #fff;
      -webkit-app-region: no-drag;
    }
    .back-icon {
      height: 33px;
      display: grid;
      place-items: center;
      overflow: hidden;
      cursor: pointer;
      -webkit-app-region: no-drag;
      transition: width 0.3s linear;
      will-change: width;
      &:hover {
        background-color: red;
      }
    }
  }
  .topbar-body {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 33px;
    .opt-minimize,
    .opt-maximize,
    .opt-close {
      display: grid;
      place-items: center;
      min-width: 40px;
      height: 33px;
      line-height: 33px;
      padding: 0 10px;
      text-align: center;
      color: #fff;
      -webkit-app-region: no-drag;
      cursor: pointer;
      &:hover {
        background: red;
      }
    }
  }
}
</style>
