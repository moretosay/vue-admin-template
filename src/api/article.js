import request from '@/utils/request'

export function addSellerInfo(data) {
  console.log('article createArticle:' + data)
  return request({
    url: 'http://localhost:5000/seller/addSellerInfo',
    // headers: {
    //   'Content-Type': 'application/x-www-form-urlencoded'
    // },
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

// export function fetchArticle(id) {
//   return request({
//     url: '/vue-admin-template/article/detail',
//     method: 'get',
//     params: { id }
//   })
// }
//
// export function fetchPv(pv) {
//   return request({
//     url: '/vue-admin-template/article/pv',
//     method: 'get',
//     params: { pv }
//   })
// }


