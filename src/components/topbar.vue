<template>
  <div id="topbar" ref="topbar">
    <div class="topbar-logo">
        <div v-if="showBackBtn" @click="back" class="back-icon">
          <span>
            <i class="el-icon-arrow-left"></i>
          </span>
        </div>
        <img :style="logoMarginLeft" src="@/assets/logo.png" width="24" height="24">
        <span>{{ app.getName() }} {{ app.getVersion() }}</span>
    </div>
    <div>
      <span class="opt-minimize" @click.stop="minimize">
        <i class="el-icon-minus"></i>
      </span>
      <span class="opt-maximize" @click.stop="maximize">
        <i :class="fullscreen"></i>
      </span>
      <span class="opt-close" @click.stop="close">
        <i class="el-icon-close"></i>
      </span>
    </div>
  </div>
</template>

<script>

import { remote } from "electron";
import { computed, onMounted } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import { WindowSize, WindowSizeIcon } from '@/constants/constants';

export default {
  name: "topbar",
  setup() {

    let currWindow = null,
        app = remote.app,
        windowSize = WindowSize.normal;

    // 获取路由器实例
    const router = useRouter();
    // route是响应式对象,可监控器变化
    const route = useRoute();

    onMounted(() => {

      currWindow = remote.getCurrentWindow(); // 当前窗口

      document.addEventListener("visibilitychange", () => {
        var isHidden = document.hidden;
        if (isHidden) {
          if (currWindow.isMinimized()) {
            windowSize = WindowSize.minimize;
          } else {
            windowSize = WindowSize.normal;
          }
        } else {
          if (currWindow.isMaximized()) {
            windowSize = WindowSize.maximize;
          } else {
            windowSize = WindowSize.normal;
          }
        }
      });
    });


    // 计算属性
    const fullscreen = computed(() => 
      windowSize === WindowSize.normal ? WindowSizeIcon.max : WindowSizeIcon.normal
    );

    const showBackBtn = computed(() => 
      route.path !== '/'
    );

    const logoMarginLeft = computed(() => route.path === '/' ? { marginLeft: '10px' } : null);

    const maximize = () => {
      if (currWindow.isMaximized()) {
        currWindow.unmaximize();
        windowSize = WindowSize.normal;
      } else {
        currWindow.maximize();
        windowSize = WindowSize.maximize;
      }
    }

    const minimize = () => {
      if (!currWindow.isMinimized()) {
        currWindow.minimize();
        windowSize = WindowSize.minimize;
      }
    }

    const close = () => {
      remote.app.quit();
    }

    const back = () => {
      router.back();
    }

    return {
      app,
      fullscreen,
      showBackBtn,
      logoMarginLeft,
      maximize,
      minimize,
      close,
      back
    }
  }
};
</script>

<style lang="scss" scoped>
#topbar {
  height: 33px;
  background: var(--primary-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  -webkit-app-region: drag;
  .topbar-logo {
      display: flex;
      align-items: center;
      flex-direction: row;
      justify-content: flex-start;
      .back-icon {
        margin-right: 10px;
        font-size: 24px;
        cursor: pointer;
        &:hover {
          background-color: red;
        }
      }
  }
  div {
    height: 33px;
    span {
      display: inline-block;
      min-width: 40px;
      height: 33px;
      line-height: 33px;
      padding: 0 10px;
      text-align: center;
      color: #fff;
      -webkit-app-region: no-drag;
    }
  }

  .opt-minimize,
  .opt-maximize,
  .opt-close {
    cursor: pointer;
    &:hover {
      background: red;
    }
  }
}
</style>
