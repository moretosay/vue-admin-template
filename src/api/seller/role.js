import request from '@/utils/request'

export function addRoleInfo(data) {
  return request({
    url: '/user/role/addRoleInfo',
    method: 'post',
    data
  })
}

export function editRoleInfo(data) {
  return request({
    url: '/user/role/editRoleInfo',
    method: 'post',
    data
  })
}

export function deleteRoleInfo(data) {
  return request({
    url: '/user/role/deleteRoleInfo',
    method: 'post',
    params: data
  })
}

export function findRoleList(data) {
  return request({
    url: '/user/role/findRoleList',
    method: 'post',
    data
  })
}

