import request from '@/utils/request'

// 查询用户偏好列表
export function listPreference(query) {
  return request({
    url: '/route/preference/list',
    method: 'get',
    params: query
  })
}

// 查询用户偏好详细
export function getPreference(preferenceId) {
  return request({
    url: '/route/preference/' + preferenceId,
    method: 'get'
  })
}

// 新增用户偏好
export function addPreference(data) {
  return request({
    url: '/route/preference',
    method: 'post',
    data: data
  })
}

// 修改用户偏好
export function updatePreference(data) {
  return request({
    url: '/route/preference',
    method: 'put',
    data: data
  })
}

// 删除用户偏好
export function delPreference(preferenceId) {
  return request({
    url: '/route/preference/' + preferenceId,
    method: 'delete'
  })
}

// 批量删除用户偏好
export function delPreferences(preferenceIds) {
  return request({
    url: '/route/preference/' + preferenceIds,
    method: 'delete'
  })
}

// 导出用户偏好
export function exportPreference(query) {
  return request({
    url: '/route/preference/export',
    method: 'post',
    params: query
  })
}

// 查询用户ID（关联sys_user.user_id）（关联用户信息表）选项列表
export function getUserIdOptions() {
  return request({
    url: '/route/preference/userId/options',
    method: 'get'
  })
}
