import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import store from "@/store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "login",
    meta: {
      title: "后台登录",
      keepAlive: false,
      requireAuth: false,
    },
    components: {
      // 对应 <router-view name="blank"></router-view>
      blank: () => import(`@/pages/login/index.vue`),
      // resolve => require(['@/pages/login/index.vue'], resolve)
    },
  },
  {
    path: "/admin",
    name: "admin",
    meta: {
      title: "管理端",
      keepAlive: false,
      requireAuth: true,
    },
    component: () => import(`@/pages/admin/index.vue`),
  },
  {
    path: "/form",
    props: (route) => ({
      _id: route.query._id,
      category: route.query.category,
    }),
    name: "form",
    meta: {
      title: "表单",
      keepAlive: false,
      requireAuth: true,
    },
    component: () => import(`@/components/form.vue`),
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach(function (to, from, next) {
  const requireAuth = to.meta.requireAuth;
  console.log("store.state===", store);
  if (requireAuth) {
    // @ts-ignore
    const isLogin = store.state.admin.isLogin;
    if (isLogin) {
      next();
    } else {
      if (from.name !== "login") {
        next({ name: "login" });
      }
    }
  } else {
    next();
  }
});

export default router;
