import request from '@/utils/request'

export function addSellerInfo(data) {
  return request({
    url: 'http://localhost:5000/seller/addSellerInfo',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded'
    // },
    method: 'post',
    data
  })
}

export function addSellerInfoContainPic(data) {
  return request({
    url: 'http://localhost:5000/seller/addSellerInfoContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function editSellerInfo(data) {
  return request({
    url: 'http://localhost:5000/seller/editSellerInfo',
    method: 'post',
    data
  })
}

export function editSellerInfoContainPic(data) {
  return request({
    url: 'http://localhost:5000/seller/editSellerInfoContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function deleteSellerInfo(data) {
  return request({
    url: 'http://localhost:5000/seller/deleteSellerInfo',
    method: 'post',
    params: data
  })
}

export function findSellerList(data) {
  return request({
    url: 'http://localhost:5000/seller/findSellerList',
    method: 'post',
    data
  })
}

