import { createRouter, createWebHashHistory } from 'vue-router'
import store from '@/store';


const routes = [
  {
    path: '/login',
    name: 'login',
    meta: {
        title: '后台登录',
        keepAlive: false,
        requireAuth: false
    },
    components: {
        // 对应 <router-view name="blank"></router-view>
        blank: () => import(`@/pages/login/index.vue`)
        // resolve => require(['@/pages/login/index.vue'], resolve)
    }
  },
    // {
    //     path: '/',
    //     name: 'index',
    //     meta: {
    //         title: '首页',
    //         keepAlive: false,
    //         requireAuth: false
    //     },
    //     component: () => import(`@/pages/index/index.vue`)
    // },
  {
      path: '/',
      name: 'web',
      meta: {
          title: '代码片段页',
          keepAlive: false,
          requireAuth: false
      },
      component: () => import(`@/pages/code/index.vue`)
  },
  {
      path: '/admin',
      name: 'admin',
      meta: {
          title: '管理端',
          keepAlive: false,
          requireAuth: true
      },
      component: () => import(`@/pages/admin/index.vue`)
  },
  {
      path: '/form',
      props: route => ({
        _id:  route.query._id,
        category: route.query.category
      }),
      name: 'form',
      meta: {
          title: '表单',
          keepAlive: false,
          requireAuth: true
      },
      component: () => import(`@/components/form.vue`)
  },
  // {
  //     path: "*",
  //     redirect: {
  //         name: 'admin'
  //     }
  // }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach(function (to, from, next) {
  const requireAuth = to.meta.requireAuth
  if (requireAuth) {
    const isLogin = store.state.admin.isLogin
    if (isLogin) {
      next();
    } else {
      if (from.name !== 'login') {
        next({ name: 'login'})
      }
    }
  } else {
    next()
  }
})


export default router
