import { asyncRoutes, constantRoutes } from '@/router'

/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export function filterAsyncRoutes(routes, roles) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, roles)
        // forCheck() 方法递归判断该节点下是否存在页面，不存在则隐藏
        // // true：不存在，false：存在
        // tmp.hidden = forCheck(tmp.children)
      }
      res.push(tmp)
    }

    /**
     * 递归子节点，判断是否存在展示页面，存在返回 false，不存在返回 true
     * @param routes
     */
    // function forCheck(routes) {
    //   // 设置默认为隐藏
    //   let isHidden = true
    //   // 判断是否存页面，不存在说明该节点下不存在页面
    //   if (routes != null && routes.length > 0) {
    //     // 循环子目录，如果子目录中不存在需要权限页面
    //     // 说明子页面全是展开栏，隐藏
    //     for (const route of routes) {
    //       // 存在 permission 说明为页面，不存在说明为展开栏，将子页面列表继续递归
    //       if (route.meta && route.meta.roles) {
    //         isHidden = false
    //         return
    //       } else {
    //         isHidden = forCheck(route.children)
    //       }
    //     }
    //   }
    //   return isHidden
    // }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, roles) {
    return new Promise(resolve => {
      const accessedRoutes = filterAsyncRoutes(asyncRoutes, roles)
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
