import request from '@/utils/request'

// 查询统计数据列表
export function listSummary(query) {
  return request({
    url: '/route/summary/list',
    method: 'get',
    params: query
  })
}

// 查询统计数据详细
export function getSummary(statId) {
  return request({
    url: '/route/summary/' + statId,
    method: 'get'
  })
}

// 新增统计数据
export function addSummary(data) {
  return request({
    url: '/route/summary',
    method: 'post',
    data: data
  })
}

// 修改统计数据
export function updateSummary(data) {
  return request({
    url: '/route/summary',
    method: 'put',
    data: data
  })
}

// 删除统计数据
export function delSummary(statId) {
  return request({
    url: '/route/summary/' + statId,
    method: 'delete'
  })
}

// 批量删除统计数据
export function delSummarys(statIds) {
  return request({
    url: '/route/summary/' + statIds,
    method: 'delete'
  })
}

// 导出统计数据
export function exportSummary(query) {
  return request({
    url: '/route/summary/export',
    method: 'post',
    params: query
  })
}
