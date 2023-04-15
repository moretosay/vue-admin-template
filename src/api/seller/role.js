import request from '@/utils/request'

export function addRoleInfo(data) {
  return request({
    url: 'http://localhost:5000/user/role/addRoleInfo',
    method: 'post',
    data
  })
}

export function editRoleInfo(data) {
  return request({
    url: 'http://localhost:5000/user/role/editRoleInfo',
    method: 'post',
    data
  })
}

export function deleteRoleInfo(data) {
  return request({
    url: 'http://localhost:5000/user/role/deleteRoleInfo',
    method: 'post',
    params: data
  })
}

export function findRoleList(data) {
  return request({
    url: 'http://localhost:5000/user/role/findRoleList',
    method: 'post',
    data
  })
}

