const { defineConfig } = require("@vue/cli-service");
const { version, name: productName } = require("./package.json");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const { default: AutoImport } = require("unplugin-auto-import/webpack");
const { default: Components } = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

const downloadURL = `https://cdn.xiongyechang.com`;

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
  chainWebpack: (config) => {
    config.target("electron-renderer");
  },
  configureWebpack: {
    // entry: path.resolve(__dirname, "public", 'index.html'),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      externals: ["clipboard"], // Cannot find module 'clipboard'
      builderOptions: {
        afterPack: async (context) => {
          // 执行上传脚本
          console.log("上传构建文件到服务器...afterPack");
        },
        afterAllArtifactBuild: async (context) => {
          const distDir = path.join(context.outDir, "dist_electron");
          // 构建完成后执行的操作
          console.log("上传构建文件到服务器...afterAllArtifactBuild");
          exec(
            `node ${path.resolve(__dirname, "./scripts/upload.mjs")}`,
            (err, stdout, stderr) => {
              if (err) {
                console.error(`上传失败: ${stderr}`);
                process.exit(1);
              }
              console.log("上传成功:", stdout);
            },
          );
        },
        appId: "cs.xiongyechang.com",
        productName: productName, // 项目名，也是生成的安装文件名，即baoma.exe
        copyright: "Copyright © 2021", // 版权信息
        win: {
          icon: "./public/favicon.ico",
          artifactName: "${productName}@${version}.exe",
          target: [
            {
              target: "nsis", //利用nsis制作安装程序
              arch: [
                "x64", //64位
                // "ia32", //32位
              ],
            },
          ],
        },
        mac: {
          icon: "./public/favicon.icns", // 这里是设置的 dock 里面的图标
          category: "public.app-category.utilities", // 应用类型
          target: ["dmg"], // 打包的目标类型(默认是dmg和zip),支持很多类型，具体看文档
          artifactName: "${productName}@${version}.dmg",
        },
        linux: {
          icon: "./public/logo.png", // 包含各种尺寸图标的文件夹
          target: ["AppImage", "deb", "rpm"],
          category: "Utility",
        },
        nsis: {
          oneClick: false, // 是否一键安装
          allowElevation: true, // 允许请求提升。 如果为false，则用户必须使用提升的权限重新启动安装程序。
          allowToChangeInstallationDirectory: true, // 允许修改安装目录
          installerIcon: "./public/favicon.ico", // 安装图标
          uninstallerIcon: "./public/favicon.ico", //卸载图标
          installerHeaderIcon: "./public/favicon.ico", // 安装时头部图标
          createDesktopShortcut: true, // 创建桌面图标
          createStartMenuShortcut: true, // 创建开始菜单图标
          shortcutName: productName, // 图标名称
        },
        publish: [
          {
            provider: "generic",
            url: downloadURL,
          },
        ],
      },
    },
  },
});
