import request from '@/utils/request'

export function addCommodityList(data) {
  return request({
    url: '/seller/commodity/addCommodityList',
    method: 'post',
    data
  })
}

export function addCommodityListContainPic(data) {
  return request({
    url: '/seller/commodity/addCommodityListContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function editCommodityInfo(data) {
  return request({
    url: '/seller/commodity/editCommodityInfo',
    method: 'post',
    data
  })
}

export function editCommodityInfoContainPic(data) {
  return request({
    url: '/seller/commodity/editCommodityInfoContainPic',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    method: 'post',
    data
  })
}

export function deleteCommodityInfo(data) {
  return request({
    url: '/seller/commodity/deleteCommodityInfo',
    method: 'post',
    params: data
  })
}

export function findCommodityList(data) {
  return request({
    url: '/seller/commodity/findCommodityList',
    method: 'post',
    data
  })
}

