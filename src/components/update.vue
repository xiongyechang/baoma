<template>
  <span class="opt-hover opt" title="更新">
    <el-badge :value="message" :hidden="!updateAvailable">
      <i v-if="!updating" class="iconfont icon-update"></i>
    </el-badge>
  </span>
  <el-dialog v-model="updateAvailable" title="更新" width="30%">
    <el-progress type="circle" :percentage="progress" />
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancelUpdate">取消</el-button>
        <el-button type="primary" @click="update">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import { ref, onMounted, defineComponent } from "vue";
import { Update } from "@/constants/constants";
export default defineComponent({
  name: "update-component",
  setup() {
    const updateAvailable = ref(false),
      message = ref(`有更新啦`),
      updating = ref(false),
      progress = ref(0),
      dialogVisible = ref(false);
    onMounted(() => {
      // 检查是否有更新
      ipcRenderer.send(Update.CheckForUpdate);

      const methods: Array<{
        key: string;
        method: (event: Event, progress: any) => void;
      }> = [
        {
          key: Update.IsUpdate, // 有更新
          method: () => {
            updateAvailable.value = true;
            dialogVisible.value = true;
          },
        },
        {
          key: Update.DownloadProgress, // 正在更新
          method: (event: Event, progress: any) => {
            console.log("download: ", event, progress);
            if (!updating.value) {
              updating.value = true;
            }
            progress.value = progress.percent.toFixed(2);
          },
        },
        {
          key: Update.Message, // 有消息
          method: (data: any) => {
            console.log(data);
          },
        },
      ];

      methods.forEach(({ key, method }) => {
        ipcRenderer.on(key, method);
      });
    });

    const update = () => {
      ipcRenderer.send(Update.IsUpdate, true);
      message.value = `双击取消更新`;
    };

    const cancelUpdate = () => {
      if (updating.value) {
        ipcRenderer.send(Update.CancelUpdate, true);
      } else {
        dialogVisible.value = false;
      }
    };

    return {
      updateAvailable,
      message,
      updating,
      progress,
      update,
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
