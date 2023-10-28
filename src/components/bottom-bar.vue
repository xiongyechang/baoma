<template>
  <div id="bottombar" ref="bottombar">
    <div class="opts">
      <span class="opt" title="电量">
        <i class="iconfont" :class="batteryInfo.icon"></i>
        <span class="iconfont-title">{{ batteryInfo.number }}%</span>
      </span>
      <span class="opt" title="网络">
        <i class="iconfont" :class="[networkInfo.icon]"></i>
      </span>
      <Update />
      <span
        class="opt-hover opt"
        title="后台管理系统"
        @click.stop="goLoginPage"
      >
        <el-icon><UserFilled /></el-icon>
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from "vue";
import { useRoute, useRouter } from "vue-router";
import Update from "@/components/update.vue";
import { NETWORK, BATTERY } from "@/constants/constants";
import { UserFilled } from "@element-plus/icons-vue";
import { useBattery, useNetwork } from "@vueuse/core";
export default defineComponent({
  name: "bottom-bar",
  components: { Update, UserFilled },
  setup() {
    // 获取路由器实例
    const router = useRouter();
    // route是响应式对象,可监控器变化
    const route = useRoute();

    const { isOnline, effectiveType, type } = useNetwork();

    const networkInfo = computed(() => {
      if (!isOnline.value) {
        return {
          icon: NETWORK.NET_OFFLINE,
        };
      }

      if (effectiveType.value === "4g") {
        return {
          icon: NETWORK.NET_ONLINE,
        };
      }

      if (type.value === "wifi") {
        return {
          icon: NETWORK.WIFI_ONLINE,
        };
      }

      return {
        icon: NETWORK.NET_OFFLINE,
      };
    });

    const { level, charging } = useBattery();

    const batteryPercentage = (level: number): string =>
      (100 * level).toFixed(0);

    const batteryInfo = computed(() => {
      if (charging.value) {
        return {
          icon: BATTERY.CHARGING,
          number: batteryPercentage(level.value),
        };
      }

      const strategies: Array<
        [
          (level: number) => boolean,
          (level: number) => {
            icon: string;
            number: string;
          }
        ]
      > = [
        [
          (level: number) => level >= 0.95 && level <= 1,
          (level: number) => ({
            icon: BATTERY.FULL,
            number: batteryPercentage(level),
          }),
        ],
        [
          (level: number) => level >= 0.8 && level < 0.95,
          (level: number) => ({
            icon: BATTERY.FULL_80,
            number: batteryPercentage(level),
          }),
        ],
        [
          (level: number) => level >= 0.6 && level < 0.8,
          (level: number) => ({
            icon: BATTERY.FULL_60,
            number: batteryPercentage(level),
          }),
        ],
        [
          (level: number) => level >= 0.4 && level < 0.6,
          (level: number) => ({
            icon: BATTERY.FULL_40,
            number: batteryPercentage(level),
          }),
        ],
        [
          (level: number) => level >= 0.2 && level < 0.4,
          (level: number) => ({
            icon: BATTERY.FULL_20,
            number: batteryPercentage(level),
          }),
        ],
        [
          (level: number) => level > 0 && level < 0,
          (level: number) => ({
            icon: BATTERY.EMPTY,
            number: batteryPercentage(level),
          }),
        ],
      ];

      const strategy = strategies.find(([condition]) => condition(level.value));

      return strategy
        ? strategy[1](level.value)
        : { icon: BATTERY.EMPTY, number: batteryPercentage(level.value) };
    });

    const goLoginPage = () => {
      const name = route.name;
      if (name === "admin") {
        router.replace({ name: "web" });
      } else {
        router.push({ name: "admin" });
      }
    };

    return {
      batteryInfo,
      networkInfo,
      goLoginPage,
    };
  },
});
</script>

<style lang="scss" scoped>
#bottombar {
  height: 33px;
  background: var(--primary-color);
  display: flex;
  justify-content: flex-end;
  align-items: center;
  -webkit-app-region: drag;

  .opts {
    height: 33px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    .opt {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 33px;
      line-height: 33px;
      padding: 0 10px;
      text-align: center;
      color: #fff;
      -webkit-app-region: no-drag;
    }
  }

  .opt-hover {
    cursor: pointer;
    &:hover {
      background: red;
    }
  }

  .iconfont-title {
    font-size: 12px;
  }
}
</style>
