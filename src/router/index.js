import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  // 仪表盘
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '商家后台管理系统', icon: 'dashboard' }
    }]
  },
  {
    path: '/seller',
    component: Layout,
    name: 'Seller',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/seller'),
        name: 'SellerDetail',
        meta: { title: '商家管理', icon: 'form' }
      }
    ]
  },
  {
    path: '/category',
    component: Layout,
    name: 'Category',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/category'),
        name: 'CategoryDetail',
        meta: { title: '类目管理', icon: 'form' }
      }
    ]
  },
  {
    path: '/commodity',
    component: Layout,
    name: 'Commodity',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/commodity'),
        name: 'CommodityDetail',
        meta: { title: '商品管理', icon: 'form' }
      }
    ]
  },
  {
    path: '/order',
    component: Layout,
    name: 'Order',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/order'),
        name: 'OrderDetail',
        meta: { title: '订单管理', icon: 'table' }
      }
    ]
  }

  // 404 page must be placed at the end !!!
  // 动态路由，即权限控制的路由模块是动态添加进去的，404监听路由是在默认路由里面的，优先级比动态路由要高，所以刷新后默认先被404接管了，
  // 把404监听路由也放到动态路由的末尾就可以了
  // { path: '*', redirect: '/404', hidden: true }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [

  {
    path: '/role',
    component: Layout,
    name: 'Role',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/role'),
        name: 'RoleDetail',
        meta: { title: '角色管理', icon: 'user', roles: ['admin'] }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    name: 'User',
    children: [
      {
        path: 'detail',
        component: () => import('@/views/seller/user'),
        name: 'UserDetail',
        meta: { title: '用户管理', icon: 'user', roles: ['admin'] }
      }
    ]
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
