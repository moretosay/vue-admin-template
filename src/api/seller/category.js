import request from '@/utils/request'

export function addCategoryList(data) {
  return request({
    url: '/seller/category/addCategoryList',
    method: 'post',
    data
  })
}

export function editCategoryInfo(data) {
  return request({
    url: '/seller/category/editCategoryInfo',
    method: 'post',
    data
  })
}

export function deleteCategoryInfo(data) {
  return request({
    url: '/seller/category/deleteCategoryInfo',
    method: 'post',
    params: data
  })
}

export function findCategoryList(data) {
  return request({
    url: '/seller/category/findCategoryList',
    method: 'post',
    data
  })
}

