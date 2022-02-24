import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../components/login')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../components/register')
  }, {
    path: '/home',
    name: 'home',
    component: () => import('../views/Home'),
    meta: {
      requireAuth: true
    }
  }, {
    path: '/files',
    name: 'files',
    component: () => import('../components/files'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/picfile',
    name: 'picfile',
    component: () => import('../components/picFile'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/videofile',
    name: 'videofile',
    component: () => import('../components/videoFile'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/musicfile',
    name: 'musicfile',
    component: () => import('../components/musicFile'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/docfile',
    name: 'docfile',
    component: () => import('../components/docFile'),
    meta: {
      requireAuth: true
    }
  }, {
    path: '/unkonwnfile',
    name: 'unkonwnfile',
    component: () => import('../components/unknownFile'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/garbage',
    name: 'garbage',
    component: () => import('../components/garbage'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/myshare',
    name: 'myshare',
    component: () => import('../components/myShare'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/share',
    name: 'share',
    component: () => import('../components/share'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/logger',
    name: 'logger',
    component: () => import('../components/logger'),
    meta: {
      requireAuth: true
    }
  },
  {
    path: '/resetpassword',
    name: 'resetpassword',
    component: () => import('../components/resetPassword')

  },
  {
    path: '/',
    component: () => import('../views/Home'),
    meta: {
      requireAuth: true
    }
  }
]


const router = new VueRouter({
  mode: 'history',
  // base: process.env.BASE_URL,
  routes
})
//全局守卫
router.beforeEach((to, from, next) => {

  if (to.matched.some(record => record.meta.requireAuth)) {
    if (sessionStorage.getItem('user') === null) {
      next({
        path: '/login',
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      next();
    }
  }
  next();
});

export default router
