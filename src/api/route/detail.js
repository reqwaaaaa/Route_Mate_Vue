import request from '@/utils/request'

// 查询POI信息列表
export function listDetail(query) {
  return request({
    url: '/route/detail/list',
    method: 'get',
    params: query
  })
}

// 查询POI信息详细
export function getDetail(poiId) {
  return request({
    url: '/route/detail/' + poiId,
    method: 'get'
  })
}

// 新增POI信息
export function addDetail(data) {
  return request({
    url: '/route/detail',
    method: 'post',
    data: data
  })
}

// 修改POI信息
export function updateDetail(data) {
  return request({
    url: '/route/detail',
    method: 'put',
    data: data
  })
}

// 删除POI信息
export function delDetail(poiId) {
  return request({
    url: '/route/detail/' + poiId,
    method: 'delete'
  })
}

// 批量删除POI信息
export function delDetails(poiIds) {
  return request({
    url: '/route/detail/' + poiIds,
    method: 'delete'
  })
}

// 导出POI信息
export function exportDetail(query) {
  return request({
    url: '/route/detail/export',
    method: 'post',
    params: query
  })
}

// 查询贡献者ID（关联sys_user.user_id）（关联用户信息表）选项列表
export function getContributorIdOptions() {
  return request({
    url: '/route/detail/contributorId/options',
    method: 'get'
  })
}

// 查询审核人ID（关联用户信息表）选项列表
export function getAuditByOptions() {
  return request({
    url: '/route/detail/auditBy/options',
    method: 'get'
  })
}
