<template>
  <span class="opt-hover opt" title="更新">
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
      <span class="dialog-footer">
        <el-button @click="cancelUpdate" :disabled="!updating"
          >取消更新</el-button
        >
        <el-button type="primary" @click="onUpdate">更新</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { IpcRendererEvent, ipcRenderer } from "electron";
import { ref, onMounted, defineComponent } from "vue";
import { Update } from "@/constants/constants";

export default defineComponent({
  name: "update-component",
  setup() {
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

    return {
      updateAvailable,
      dialogVisible,
      updating,
      percentage,
      onUpdate,
      cancelUpdate,
    };
  },
});
</script>

<style lang="scss" scoped>
.opt {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 33px;
  min-width: 40px;
  line-height: 33px;
  padding: 0 10px;
  text-align: center;
  color: #fff;
  -webkit-app-region: no-drag;
}
.opt-hover {
  cursor: pointer;
  &:hover {
    background: red;
  }
}
</style>
