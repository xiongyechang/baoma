import { State } from "..";

const qiniuToken = (state: State) => state.qiniuToken;

const qiniuDomain = (state: State) => state.qiniuDomain;

const userInfo = (state: State) =>
  state.userInfo && JSON.parse(atob(state.userInfo));

export default {
  qiniuToken,
  qiniuDomain,
  userInfo,
};
