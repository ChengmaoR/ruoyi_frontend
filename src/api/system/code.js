import request from '@/utils/request'

// 查询品类码列表
export function listCode(query) {
  return request({
    url: '/system/code/list',
    method: 'get',
    params: query
  })
}

// 查询品类码详细
export function getCode(id) {
  return request({
    url: '/system/code/' + id,
    method: 'get'
  })
}

// 新增品类码
export function addCode(data) {
  return request({
    url: '/system/code',
    method: 'post',
    data: data
  })
}

// 修改品类码
export function updateCode(data) {
  return request({
    url: '/system/code',
    method: 'put',
    data: data
  })
}

// 删除品类码
export function delCode(id) {
  return request({
    url: '/system/code/' + id,
    method: 'delete'
  })
}
