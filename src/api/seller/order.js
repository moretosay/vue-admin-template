import request from '@/utils/request'

export function editOrderInfo(data) {
  return request({
    url: 'http://localhost:5000/customer/order/editOrderInfo',
    method: 'post',
    data
  })
}

export function deleteOrderInfo(data) {
  return request({
    url: 'http://localhost:5000/customer/order/deleteOrderInfo',
    method: 'post',
    params: data
  })
}

export function findOrderList(data) {
  return request({
    url: 'http://localhost:5000/customer/order/findOrderList',
    method: 'post',
    data
  })
}

export function closeSse(data) {
  return request({
    url: 'http://localhost:5000/sse/close',
    method: 'post',
    params: data
  })
}

