import request from '@/utils/request'

// 查询热点数据列表
export function listZone(query) {
  return request({
    url: '/route/zone/list',
    method: 'get',
    params: query
  })
}

// 查询热点数据详细
export function getZone(hotspotId) {
  return request({
    url: '/route/zone/' + hotspotId,
    method: 'get'
  })
}

// 新增热点数据
export function addZone(data) {
  return request({
    url: '/route/zone',
    method: 'post',
    data: data
  })
}

// 修改热点数据
export function updateZone(data) {
  return request({
    url: '/route/zone',
    method: 'put',
    data: data
  })
}

// 删除热点数据
export function delZone(hotspotId) {
  return request({
    url: '/route/zone/' + hotspotId,
    method: 'delete'
  })
}

// 批量删除热点数据
export function delZones(hotspotIds) {
  return request({
    url: '/route/zone/' + hotspotIds,
    method: 'delete'
  })
}

// 导出热点数据
export function exportZone(query) {
  return request({
    url: '/route/zone/export',
    method: 'post',
    params: query
  })
}

// 查询分析任务ID（关联分析任务表）选项列表
export function getAnalysisTaskIdOptions() {
  return request({
    url: '/route/zone/analysisTaskId/options',
    method: 'get'
  })
}
