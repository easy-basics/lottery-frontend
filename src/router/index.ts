import { createRouter, createWebHashHistory } from 'vue-router'
// 基础路由配置
const routes = [
  {
    path: '/',
    component: () => import('@/pages/index.vue'),
  },
  // 抽奖活动路由
  {
    path: '/lottery',
    component: () => import('@/pages/lottery/index.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/pages/admin/components/adminLayout.vue'),
    children: [
      // {
      //   path: '',
      //   name: 'adminIndex',
      //   component: () => import('@/pages/admin/index.vue'),
      //   meta: {
      //     title: '管理后台',
      //   },
      // },
      {
        path: 'lotteryActivity',
        name: 'lotteryActivity',
        component: () => import('@/pages/admin/lotteryActivity.vue'),
        meta: {
          title: '抽奖活动管理',
        },
      },
      
    ],
  },


  // {
  //   path: '/',
  //   component: () => import('@/components/layouts/chat/ChatLayout.vue'),
  //   children: [
  //     {
  //       path: '',
  //       name: 'index',
  //       component: () => import('@/pages/index.vue'),
  //       meta: {
  //         title: '办公助手',
  //         full_path_title: '办公助手-首页',
  //       },
  //     },
  //     {
  //       path: 'chat/:conversation_id?',
  //       name: 'chat',
  //       component: () => import('@/pages/index.vue'),
  //       meta: {
  //         title: '会话页',
  //         full_path_title: '办公助手-会话页',
  //       },
  //     },
  //   ],
  // },
  // {
  //   path: '/test',
  //   name: 'test',
  //   component: () => import('@/pages/test.vue'),
  //   meta: {
  //     title: 'mdtest',
  //     full_path_title: '办公助手-mdtest',
  //   },
  // },
  // {
  //   path: '/:pathMatch(.*)*', // 通配符路由，匹配所有未定义的路由
  //   name: 'NotFound',
  //   beforeEnter: (to, from, next) => {
  //     next('/') // 重定向到首页
  //   },
  // },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
