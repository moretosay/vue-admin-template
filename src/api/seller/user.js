import request from '@/utils/request'

export function addUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/addUserInfo',
    method: 'post',
    data
  })
}

export function editUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/editUserInfo',
    method: 'post',
    data
  })
}

export function deleteUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/deleteUserInfo',
    method: 'post',
    params: data
  })
}

export function findUserList(data) {
  return request({
    url: 'http://localhost:5000/user/findUserList',
    method: 'post',
    data
  })
}

