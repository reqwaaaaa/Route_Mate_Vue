import request from '@/utils/request'

// 查询分析任务列表
export function listTask(query) {
  return request({
    url: '/route/task/list',
    method: 'get',
    params: query
  })
}

// 查询分析任务详细
export function getTask(taskId) {
  return request({
    url: '/route/task/' + taskId,
    method: 'get'
  })
}

// 新增分析任务
export function addTask(data) {
  return request({
    url: '/route/task',
    method: 'post',
    data: data
  })
}

// 修改分析任务
export function updateTask(data) {
  return request({
    url: '/route/task',
    method: 'put',
    data: data
  })
}

// 删除分析任务
export function delTask(taskId) {
  return request({
    url: '/route/task/' + taskId,
    method: 'delete'
  })
}

// 批量删除分析任务
export function delTasks(taskIds) {
  return request({
    url: '/route/task/' + taskIds,
    method: 'delete'
  })
}

// 导出分析任务
export function exportTask(query) {
  return request({
    url: '/route/task/export',
    method: 'post',
    params: query
  })
}

// 查询用户ID（关联sys_user.user_id）（关联用户信息表）选项列表
export function getUserIdOptions() {
  return request({
    url: '/route/task/userId/options',
    method: 'get'
  })
}

// 查询轨迹ID（关联route_trajectory_info.trajectory_id）（关联出行轨迹信息表）选项列表
export function getTrajectoryIdOptions() {
  return request({
    url: '/route/task/trajectoryId/options',
    method: 'get'
  })
}
