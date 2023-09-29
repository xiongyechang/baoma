import { State } from "..";

const setQiniuToken = (state: State, qiniuToken: string) => {
  state.qiniuToken = qiniuToken;
};

const setQiniuDomain = (state: State, qiniuDomain: string) => {
  state.qiniuDomain = qiniuDomain;
};

const setLoginStatus = (state: State, loginStatus: boolean) => {
  state.isLogin = loginStatus;
};

const setUserInfo = (state: State, userinfo: object) => {
  state.userInfo = btoa(JSON.stringify(userinfo));
};

export default {
  setQiniuToken,
  setQiniuDomain,
  setLoginStatus,
  setUserInfo,
};
