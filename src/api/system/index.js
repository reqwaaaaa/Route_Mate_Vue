import request from '@/utils/request'

// 获取系统统计概览数据
export function getSystemOverview() {
  return request({
    url: '/system/index/overview',
    method: 'get'
  })
}

// 获取用户注册趋势数据（最近30天）
export function getUserTrend() {
  return request({
    url: '/system/index/userTrend',
    method: 'get'
  })
}

// 获取在线用户趋势数据（最近24小时）
export function getOnlineTrend() {
  return request({
    url: '/system/index/onlineTrend',
    method: 'get'
  })
}

// 获取系统模块使用统计
export function getModuleUsage() {
  return request({
    url: '/system/index/moduleUsage',
    method: 'get'
  })
}

// 获取POI类别统计（饼图）
export function getPoiStats() {
  return request({
    url: '/stats/poi',
    method: 'get'
  })
}

// 获取热点排行（柱状图）
export function getHotspotStats() {
  return request({
    url: '/stats/hotspot',
    method: 'get'
  })
}

// 获取用户活跃度统计
export function getUserStats() {
  return request({
    url: '/stats/user',
    method: 'get'
  })
}

// 获取出行时间分布统计
export function getTrajectoryStats() {
  return request({
    url: '/stats/trajectory',
    method: 'get'
  })
}