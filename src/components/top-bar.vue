<template>
  <div
    class="flex items-center justify-between region-no-drag h-[33px]"
    style="background: var(--el-color-primary)"
  >
    <div class="flex flex-1 items-center h-[33px]">
      <span
        class="flex items-center justify-center h-full overflow-auto text-white cursor-pointer region-no-drag hover:bg-red-600 w-[0-60px]-transition"
        :style="{
          width: showBackBtn ? `60px` : 0,
        }"
        @click="back"
      >
        <el-icon><ArrowLeftBold /></el-icon>
      </span>
      <img
        :style="logoMarginLeft"
        src="@/assets/logo.png"
        width="24"
        height="24"
      />
      <span class="inline-block text-center text-white p-[10px] region-no-drag"
        >{{ name }}@{{ version }}</span
      >
    </div>
    <div class="flex justify-end items-center h-[33px]">
      <span
        class="flex items-center justify-center min-w-[40px] h-[33px] leading-[33px] p-[10px] text-center text-white region-no-drag cursor-pointer hover:bg-red-600"
        @click.stop="minimize"
      >
        <el-icon><SemiSelect /></el-icon>
      </span>
      <span
        class="flex items-center justify-center min-w-[40px] h-[33px] leading-[33px] p-[10px] text-center text-white region-no-drag cursor-pointer hover:bg-red-600"
        @click.stop="maximize"
      >
        <el-icon><FullScreen /></el-icon>
      </span>
      <span
        class="flex items-center justify-center min-w-[40px] h-[33px] leading-[33px] p-[10px] text-center text-white region-no-drag cursor-pointer hover:bg-red-600"
        @click.stop="close"
      >
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
const windowSize = ref(WindowSize.normal);

const name = app.getName();

const version = app.getVersion();

// 获取路由器实例
const router = useRouter();
// route是响应式对象,可监控器变化
const route = useRoute();

onMounted(() => {
  currWindow = getCurrentWindow(); // 当前窗口

  document.addEventListener("visibilitychange", () => {
    const isHidden = document.hidden;
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
  route.path === "/" ? { marginLeft: "10px" } : {},
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
