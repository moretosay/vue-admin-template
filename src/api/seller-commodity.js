import request from '@/utils/request'

export function addCommodityList(data) {
  return request({
    url: 'http://localhost:5000/seller/commodity/addCommodityList',
    method: 'post',
    data
  })
}

export function editCommodityInfo(data) {
  return request({
    url: 'http://localhost:5000/seller/commodity/editCommodityInfo',
    method: 'post',
    data
  })
}

export function deleteCommodityInfo(data) {
  return request({
    url: 'http://localhost:5000/seller/commodity/deleteCommodityInfo',
    method: 'post',
    params: data
  })
}

export function findCommodityList(data) {
  return request({
    url: 'http://localhost:5000/seller/commodity/findCommodityList',
    method: 'post',
    data
  })
}

