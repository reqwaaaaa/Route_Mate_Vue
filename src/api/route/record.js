import request from '@/utils/request'

// 查询消息通知列表
export function listRecord(query) {
  return request({
    url: '/route/record/list',
    method: 'get',
    params: query
  })
}

// 查询消息通知详细
export function getRecord(messageId) {
  return request({
    url: '/route/record/' + messageId,
    method: 'get'
  })
}

// 新增消息通知
export function addRecord(data) {
  return request({
    url: '/route/record',
    method: 'post',
    data: data
  })
}

// 修改消息通知
export function updateRecord(data) {
  return request({
    url: '/route/record',
    method: 'put',
    data: data
  })
}

// 删除消息通知
export function delRecord(messageId) {
  return request({
    url: '/route/record/' + messageId,
    method: 'delete'
  })
}

// 批量删除消息通知
export function delRecords(messageIds) {
  return request({
    url: '/route/record/' + messageIds,
    method: 'delete'
  })
}

// 导出消息通知
export function exportRecord(query) {
  return request({
    url: '/route/record/export',
    method: 'post',
    params: query
  })
}

// 查询发送者ID（关联sys_user.user_id）（关联用户信息表）选项列表
export function getSenderIdOptions() {
  return request({
    url: '/route/record/senderId/options',
    method: 'get'
  })
}

// 查询接收者ID（关联sys_user.user_id，系统消息时为空）（关联用户信息表）选项列表
export function getReceiverIdOptions() {
  return request({
    url: '/route/record/receiverId/options',
    method: 'get'
  })
}
