import { login, loginOut, getInfo } from '@/api/seller/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const getDefaultState = () => {
  return {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  }
}

const state = getDefaultState()

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState())
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USER_ID: (state, userId) => {
    state.userId = userId
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { userName, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ userName: userName.trim(), password: password }).then(response => {
        const token = response.data
        commit('SET_TOKEN', token)
        setToken(token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      var requestParam = {
        token: state.token
      }
      getInfo(requestParam).then(response => {
        const { data } = response

        if (!data) {
          return reject('Verification failed, please Login again.')
        }

        const { userId, userName, headPicUrl } = data

        // if (!roleCodeList || roleCodeList.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        // commit('SET_ROLES', roleCodeList)

        commit('SET_USER_ID', userId)
        commit('SET_NAME', userName)
        commit('SET_AVATAR', headPicUrl)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user loginOut
  loginOut({ commit, state }) {
    return new Promise((resolve, reject) => {
      var requestParam = {
        token: state.token
      }
      loginOut(requestParam).then(() => {
        removeToken() // must remove  token  first
        resetRouter()
        commit('RESET_STATE')
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_STATE')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

