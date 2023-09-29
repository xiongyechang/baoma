import { createStore, createLogger, ActionContext } from "vuex";
import admin from "./admin";
import createPersistedState from "vuex-persistedstate";

const plugins = [createPersistedState()];

process.env.NODE_ENV !== "production" && plugins.push(createLogger());

export type State = {
  qiniuToken: string;
  qiniuDomain: string;
  isLogin: boolean;
  userInfo: any;
};

export default createStore<{
  state: State;
  actions: {
    getQiniuToken: (context: ActionContext<State, any>) => void;
    getQiniuDomain: (context: ActionContext<State, any>) => void;
    setLoginStatus: (
      context: ActionContext<State, any>,
      loginStatus: boolean
    ) => Promise<boolean>;
  };
  mutations: {
    setQiniuToken: (state: State, qiniuToken: string) => void;
    setQiniuDomain: (state: State, qiniuDomain: string) => void;
    setLoginStatus: (state: State, loginStatus: boolean) => void;
    setUserInfo: (state: State, userinfo: object) => void;
  };
  getters: {
    qiniuToken: (state: State) => string;
    qiniuDomain: (state: State) => string;
    userInfo: (state: State) => object;
  };
}>({
  modules: {
    admin,
  },
  plugins,
});
