import request from '@/utils/request'

export function addSellerInfo(data) {
  return request({
    url: '/seller/addSellerInfo',
    method: 'post',
    data
  })
}

export function addSellerInfoContainPic(data) {
  return request({
    url: '/seller/addSellerInfoContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function editSellerInfo(data) {
  return request({
    url: '/seller/editSellerInfo',
    method: 'post',
    data
  })
}

export function editSellerInfoContainPic(data) {
  return request({
    url: '/seller/editSellerInfoContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function deleteSellerInfo(data) {
  return request({
    url: '/seller/deleteSellerInfo',
    method: 'post',
    params: data
  })
}

export function findSellerList(data) {
  return request({
    url: '/seller/findSellerList',
    method: 'post',
    data
  })
}

