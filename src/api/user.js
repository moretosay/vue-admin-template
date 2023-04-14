import request from '@/utils/request'

export function login(data) {
  return request({
    url: 'http://localhost:5000/user/login',
    // url: 'vue-admin-template/user/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: 'http://localhost:5000/user/getUserInfo',
    method: 'get',
    params: { token }
  })
}

export function logout(token) {
  return request({
    // url: 'http://localhost:5000/user/logout',
    url: 'http://localhost:5000/user/logout',
    method: 'post',
    params: { token }
  })
}
