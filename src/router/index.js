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
        blank: () => import(`@/views/login/login.vue`)
        // resolve => require(['@/views/login/login.vue'], resolve)
    }
  },
  {
      path: '/',
      name: 'web',
      meta: {
          title: '主页',
          keepAlive: false,
          requireAuth: false
      },
      component: () => import(`@/views/web/web.vue`)
  },
  {
      path: '/admin',
      name: 'admin',
      meta: {
          title: '管理端',
          keepAlive: false,
          requireAuth: true
      },
      component: () => import(`@/views/admin/admin.vue`)
  },
  {
      path: '/form/:_id?',
      props: true,
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
