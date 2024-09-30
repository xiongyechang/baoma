import * as qiniu from "qiniu-js";
import randomstring from "randomstring";
import mime from "mime";
import store from "@/store";

export const useQiniu = () => {
  const upload = (file: File) => {
    return new Promise((resolve, reject) => {
      const key =
        randomstring.generate({ capitalization: "lowercase", length: 8 }) +
        "-" +
        file.name;

      const config = {
        useCdnDomain: true,
        region: qiniu.region.z0,
      };

      const putExtra = {
        fname: file.name,
        mimeType: mime.getType(file.name) || undefined,
      };

      const observable = qiniu.upload(
        file,
        key,
        store.getters["admin/qiniuToken"],
        putExtra,
        config
      );

      const observer = {
        next(res: any) {
          console.log("上传进度:", res);
        },
        error(error: Error) {
          reject(error);
        },
        complete: (res: any) => {
          resolve(
            (store.getters["admin/qiniuDomain"] + "/" + res.key) as string
          );
        },
      };

      const subscription = observable.subscribe(observer); // 上传开始
      console.log(subscription);
    });
  };

  const getToken = async () => store.dispatch("admin/getQiniuToken");

  const getDomain = async () => store.dispatch("admin/getQiniuDomain");

  getDomain();
  getToken();

  return {
    upload,
    getToken,
    getDomain,
  };
};
