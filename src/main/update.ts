import { CancellationToken, autoUpdater } from "electron-updater";
import { BrowserWindow, ipcMain } from "electron";
import { Update } from "@/constants/constants";
import { baseURL } from "../config/config";

const mainWindow =
  BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];

let cancellationToken: CancellationToken | undefined;

//执行自动更新检查
const feedUrl = `${baseURL}/api/update/`; // 更新包位置

autoUpdater.autoDownload = false;

autoUpdater.setFeedURL(feedUrl);

const message = {
  error: "检查更新出错",
  checking: "正在检查更新……",
  updateAva: "检测到新版本，正在下载...",
  updateNotAva: "现在使用的就是最新版本，不用更新",
};

autoUpdater.on(Update.Error, function () {
  sendUpdateMessage({
    code: 0,
    msg: message.error,
  });
});
autoUpdater.on(Update.CheckingForUpdate, function () {
  sendUpdateMessage({
    code: 1,
    msg: message.checking,
  });
});
autoUpdater.on(Update.UpdateAvailable, function () {
  mainWindow.webContents.send(Update.IsUpdate);
});

ipcMain.on(Update.IsUpdate, (event, data) => {
  console.log(data);
  if (data) {
    autoUpdater.downloadUpdate(); // 手动下载
  }
});
// 取消下载
ipcMain.on(Update.CancelUpdate, (event, data) => {
  if (data && cancellationToken) {
    cancellationToken.cancel();
  }
});

// autoUpdater.autoDownload = false;
autoUpdater.on(Update.UpdateNotAvailable, function () {
  sendUpdateMessage({
    code: 2,
    msg: message.updateNotAva,
  });
});

// 更新下载进度事件
autoUpdater.on(Update.DownloadProgress, function (progressObj) {
  //与渲染进程通信
  console.log(progressObj.percent);
  mainWindow.webContents.send(Update.DownloadProgress, progressObj);
  mainWindow.setProgressBar(progressObj.percent / 100);
});

autoUpdater.on(Update.UpdateDownloaded, function () {
  autoUpdater.quitAndInstall();
});

ipcMain.on(Update.CheckForUpdate, () => {
  //放外面的话启动客户端执行自动更新检查
  autoUpdater.checkForUpdates().then((downloadPromise) => {
    cancellationToken = downloadPromise
      ? downloadPromise.cancellationToken
      : void 0;
  });
});

function sendUpdateMessage(param: { code: number; msg: string }) {
  mainWindow.webContents.send("message", param);
}
