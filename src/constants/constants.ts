export const HttpResponseCode = {
  OK: 200,
  NotFount: 404,
  UNAUTHORIZED: 401,
  EXCEPTION: 500,
  ERROR: 400,
};

export const Update = {
  CheckForUpdate: "check-for-update", // 检查更新
  CheckingForUpdate: "checking-for-update", // 检查更新
  IsUpdate: "is-update", // 是否更新
  IsInstallNow: "is-install-now", // 是否现在安装
  DownloadProgress: "download-progress", // 下载进度
  CancelUpdate: "cancel-update", // 取消下载
  UploadProgress: "upload-progress", // 上传进度
  Error: "error", // 错误
  UpdateAvailable: "update-available",
  UpdateNotAvailable: "update-not-available",
  UpdateDownloaded: "update-downloaded",
  Message: "message",
} as const;

export const Button = {
  OK: "确定",
  Cancel: "取消",
};

export const WindowSize = {
  maximize: "maximize",
  minimize: "minimize",
  normal: "normal",
};

export const WindowSizeIcon = {
  max: "el-icon-full-screen",
  normal: "el-icon-copy-document",
};

export const NETWORK = {
  WIFI_ONLINE: "icon-wifi-on-line",
  WIFI_OFFLINE: "icon-wifi-off-line",
  NET_ONLINE: "icon-online",
  ONLINE: "online",
  NET_OFFLINE: "icon-dev_offline",
} as const;

export const BATTERY = {
  FULL: "icon-battery-full",
  FULL_80: "icon-battery-80",
  FULL_60: "icon-battery-60",
  FULL_40: "icon-battery-40",
  FULL_20: "icon-battery-20",
  EMPTY: "icon-battery-empty",
  CHARGING: "icon-batterycharging",
} as const;

export const TreeTableActions = {
  // 操作树组件
  ADD_TREE_NODE: "ADD_TREE_NODE",
  UPDATE_TREE_NODE: "UPDATE_TREE_NODE",
  DELETE_TREE_NODE: "DELETE_TREE_NODE",
  // 操作表格
  ADD_TABLE_ROW: "ADD_TABLE_ROW",
  DELETE_TABLE_ROW: "DELETE_TABLE_ROW",
  UPDATE_TABLE_ROW: "UPDATE_TABLE_ROW",
} as const;

export const ADD_ID_LENGTH = 8;
