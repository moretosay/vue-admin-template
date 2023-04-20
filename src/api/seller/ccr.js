import request from '@/utils/request'

export function addCCRList(data) {
  return request({
    url: '/seller/ccr/addCCRList',
    method: 'post',
    data
  })
}

export function editCCRInfo(data) {
  return request({
    url: '/seller/ccr/editCCRInfo',
    method: 'post',
    data
  })
}

export function deleteCCRInfo(data) {
  return request({
    url: '/seller/ccr/deleteCCRInfo',
    method: 'post',
    params: data
  })
}

export function findCCRList(data) {
  return request({
    url: '/seller/ccr/findCCRList',
    method: 'post',
    data
  })
}

