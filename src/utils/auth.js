import Cookies from 'js-cookie'

const TokenKey = 'token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {

  // 解决浏览器控制台"某些 Cookie 滥用推荐的“SameSite“属性"提示，
  // SameSite属性值有如下：
  // Strict，最为严格，完全禁止第三方Cookie，跨站点时，任何情况下都不会发送 Cookie。换言之，只有当前网页的URL与请求目标一致，才会带上Cookie。
  // Lax，   规则稍稍放宽，大多数情况也是不发送第三方 Cookie，但是导航到目标网址的 Get 请求除外。
  // None，  Chrome 计划将Lax变为默认设置。这时，网站可以选择显式关闭SameSite属性，将其设为None。
           //不过，前提是必须同时设置Secure属性（Cookie 只能通过 HTTPS 协议发送），否则无效。
  // return Cookies.set(TokenKey, token)
  return Cookies.set(TokenKey, token, {
    sameSite: 'none',
    secure: true
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
