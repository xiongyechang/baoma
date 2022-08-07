<template>
    <span class="opt-hover opt" title='更新'>
        <el-badge :value="message" :hidden="!updateAvailable">
            <i v-if="!updating" @click="update" class="iconfont icon-update"></i>
            <div v-else @dblclick="cancelUpdate">
                <div>
                    <span class="iblock">下载进度: {{ progress }}%</span>
                </div>
            </div>
        </el-badge>
    </span>
</template>

<script>
import { ipcRenderer } from "electron";
import { ref, onMounted } from 'vue';
import { Update } from '@/constants/constants';
export default {
    name: 'update',
    setup() {
        let updateAvailable = ref(false),
              message = ref(`有更新啦`),
              updating = ref(false),
              progress = ref(0);

        onMounted(() => {
            // 检查是否有更新
            ipcRenderer.send(Update.CheckForUpdate);

            const methods = [{
              key: Update.IsUpdate, // 有更新
              method: () => {
                updateAvailable.value = true;
              }
            }, {
              key: Update.DownloadProgress, // 正在更新
              method: (event, progress) => {
                console.log('download: ', event, progress);
                if (!updating.value) {
                  updating.value = true;
                }
                progress.value = (progress.percent.toFixed(2));
                if (progress.percent == 100) {
                  updating.value = false;
                  progress.value = 0;
                }
              }
            }, {
              key: Update.Message, // 有消息
              method: data => {
                console.log(data);
              }
            }]

            methods.forEach(({ key, method }) => {
              ipcRenderer.on(key, method);
            });
        });

        const update = () => {
            ipcRenderer.send(Update.IsUpdate, true);
            message.value = `双击取消更新`;
        }

        const cancelUpdate = () => {
            ipcRenderer.send(Update.CancelUpdate, true); 
        }

        return {
            updateAvailable,
            message,
            updating,
            progress,
            update,
            cancelUpdate
        }
    }
}
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
.iblock {
    display: block;
    height: 33px;
    line-height: 33px;
}
</style>