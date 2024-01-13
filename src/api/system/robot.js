import request from '@/utils/request'

// 查询品类列表
export function listRobot (query) {
  return request({
    url: '/system/robot/list',
    method: 'get',
    params: query
  })
}

// 查询品类详细
export function getRobot (id) {
  return request({
    url: '/system/robot/' + id,
    method: 'get'
  })
}

// 新增品类
export function addRobot (data) {
  return request({
    url: '/system/robot',
    method: 'post',
    data: data
  })
}
// 生成二维码
export function makeCode (data) {
  return request({
    url: '/system/code/make',
    method: 'post',
    data: data
  })
}

// 修改品类
export function updateRobot (data) {
  return request({
    url: '/system/robot',
    method: 'put',
    data: data
  })
}

// 删除品类
export function delRobot (id) {
  return request({
    url: '/system/robot/' + id,
    method: 'delete'
  })
}
