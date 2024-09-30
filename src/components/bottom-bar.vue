<template>
  <div
    class="flex justify-start items-center drag-region h-[33px]"
    style="background: var(--el-color-primary)"
  >
    <div class="flex justify-start items-center w-full">
      <span
        class="flex justify-center items-center text-white text-center drag-no-region h-[33px] min-w-[40px] p-[10px] leading-[33px]"
        title="电量"
      >
        <i class="iconfont" :class="batteryInfo.icon"></i>
        <span class="iconfont-title">{{ batteryInfo.number }}%</span>
      </span>
      <span
        class="flex justify-center items-center text-white text-center drag-no-region h-[33px] min-w-[40px] p-[10px] leading-[33px]"
        title="网络"
      >
        <i class="iconfont" :class="[networkInfo.icon]"></i>
      </span>
      <Update />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Update from "@/components/update.vue";
import { NETWORK, BATTERY } from "@/constants/constants";
import { useBattery, useNetwork } from "@vueuse/core";

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

const batteryPercentage = (level: number): string => (100 * level).toFixed(0);

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
      },
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
</script>
