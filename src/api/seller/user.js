import request from '@/utils/request'

export function generateCheckCode(data) {
  return request({
    url: 'http://localhost:5000/user/generateCheckCode',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: 'http://localhost:5000/user/register',
    method: 'post',
    data
  })
}

export function login(data) {
  return request({
    url: 'http://localhost:5000/user/login',
    method: 'post',
    data
  })
}

export function getInfo(data) {
  return request({
    url: 'http://localhost:5000/user/getUserInfo',
    method: 'get',
    params: data
  })
}

export function loginOut(data) {
  return request({
    url: 'http://localhost:5000/user/loginOut',
    method: 'post',
    params: data
  })
}

export function forgetPassword(data) {
  return request({
    url: 'http://localhost:5000/user/forgetPassword',
    method: 'post',
    data
  })
}

export function addUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/addUserInfo',
    method: 'post',
    data
  })
}

export function editUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/editUserInfo',
    method: 'post',
    data
  })
}

export function deleteUserInfo(data) {
  return request({
    url: 'http://localhost:5000/user/deleteUserInfo',
    method: 'post',
    params: data
  })
}

export function findUserList(data) {
  return request({
    url: 'http://localhost:5000/user/findUserList',
    method: 'post',
    data
  })
}

