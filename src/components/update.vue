<template>
  <span
    class="flex items-center justify-center h-[33px] text-white text-center region-no-drag p-[10px] leading-[33px] min-w-[40px] hover:bg-red-600"
    title="更新"
  >
    <el-badge value="有更新啦" :hidden="!updateAvailable">
      <i class="iconfont icon-update"></i>
    </el-badge>
  </span>
  <el-dialog
    v-model="updateAvailable"
    title="确定更新？"
    width="30%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <el-row justify="center">
      <el-progress
        type="circle"
        :percentage="percentage"
        striped
        striped-flow
      />
    </el-row>
    <template #footer>
      <span>
        <el-button @click="cancelUpdate" :disabled="!updating"
          >取消更新</el-button
        >
        <el-button type="primary" @click="onUpdate">更新</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { IpcRendererEvent, ipcRenderer } from "electron";
import { Update } from "@/constants/constants";
import { ref, onMounted } from "vue";

const updateAvailable = ref(false),
  updating = ref(false),
  percentage = ref(0),
  dialogVisible = ref(false);

onMounted(() => {
  const methods: Array<{
    key: string;
    method: (event: IpcRendererEvent, ...args: any[]) => void;
  }> = [
    {
      key: Update.IsUpdate, // 有更新
      method() {
        updateAvailable.value = true;
        dialogVisible.value = true;
      },
    },
    {
      key: Update.DownloadProgress, // 正在更新
      method(event, progress) {
        updating.value = true;
        percentage.value = progress.percent.toFixed(2);
      },
    },
    {
      key: Update.Message, // 有消息
      method(event: IpcRendererEvent, data) {
        console.log(event, data);
      },
    },
  ];

  methods.forEach(({ key, method }) => {
    ipcRenderer.on(key, method);
  });

  // 检查是否有更新
  ipcRenderer.send(Update.CheckForUpdate);
});

const onUpdate = () => {
  ipcRenderer.send(Update.IsUpdate, true);
};

const cancelUpdate = () => {
  ipcRenderer.send(Update.CancelUpdate, true);
};
</script>
