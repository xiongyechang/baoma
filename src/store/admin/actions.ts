import { fetchQiniuToken, fetchQiniuDomain } from "@/api/api";
import { HttpResponseCode } from "@/constants/constants";
import { ActionContext } from "vuex";
import { State } from "..";

// 请求七牛云的token
const getQiniuToken = (context: ActionContext<State, any>) => {
  fetchQiniuToken()
    .then(({ code, data }) => {
      if (code === HttpResponseCode.OK) {
        context.commit("setQiniuToken", data);
      }
    })
    .catch(console.error);
};

const getQiniuDomain = (context: ActionContext<State, any>) => {
  fetchQiniuDomain()
    .then(({ code, data }) => {
      if (code === HttpResponseCode.OK) {
        context.commit("setQiniuDomain", data);
      }
    })
    .catch(console.error);
};

const setLoginStatus = (
  { commit }: ActionContext<State, any>,
  loginStatus: boolean,
) => {
  return new Promise((resolve) => {
    commit("setLoginStatus", loginStatus);
    resolve(loginStatus);
  });
};

export default {
  getQiniuToken,
  getQiniuDomain,
  setLoginStatus,
};
