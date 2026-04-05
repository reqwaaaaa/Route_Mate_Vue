import request from '@/utils/request'

// 查询出行轨迹信息列表
export function listInfo(query) {
  return request({
    url: '/route/info/list',
    method: 'get',
    params: query
  })
}

// 查询出行轨迹信息详细
export function getInfo(trajectoryId) {
  return request({
    url: '/route/info/' + trajectoryId,
    method: 'get'
  })
}

// 新增出行轨迹信息
export function addInfo(data) {
  return request({
    url: '/route/info',
    method: 'post',
    data: data
  })
}

// 修改出行轨迹信息
export function updateInfo(data) {
  return request({
    url: '/route/info',
    method: 'put',
    data: data
  })
}

// 删除出行轨迹信息
export function delInfo(trajectoryId) {
  return request({
    url: '/route/info/' + trajectoryId,
    method: 'delete'
  })
}

// 批量删除出行轨迹信息
export function delInfos(trajectoryIds) {
  return request({
    url: '/route/info/' + trajectoryIds,
    method: 'delete'
  })
}

// 导出出行轨迹信息
export function exportInfo(query) {
  return request({
    url: '/route/info/export',
    method: 'post',
    params: query
  })
}

// 查询用户ID（关联sys_user.user_id）（关联用户信息表）选项列表
export function getUserIdOptions() {
  return request({
    url: '/route/info/userId/options',
    method: 'get'
  })
}
