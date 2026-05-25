// 云函数：工时记录 CRUD
// updateById / deleteById 必须同时校验 _id 和 openId，防止越权
const cloud = require('wx-server-sdk')
cloud.init()

const COLLECTION = 'HOURLY_RECORD'

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV === 'local' ? wxContext.ENV : wxContext.ENV
  const db = cloud.database({ env })

  const { mode, id, hours, hourlyRate, income, noteDate, description } = event

  try {
    // 新增一条工时记录
    if (mode === 'add') {
      const data = {
        hours: Number(hours),
        hourlyRate: Number(hourlyRate || 0),
        income: Number(income),
        noteDate: noteDate,
        description: description || '',
        createTime: db.serverDate(),
        updateTime: db.serverDate(),
        openId: wxContext.OPENID,
        isDel: false
      }
      const res = await db.collection(COLLECTION).add({ data })
      return { code: 1, data: res, message: '记录成功' }
    }

    // 更新一条记录（必须校验 openId）
    if (mode === 'updateById') {
      if (!id) return { code: -1, message: '记录 ID 不能为空' }
      const data = {
        hours: Number(hours),
        hourlyRate: Number(hourlyRate || 0),
        income: Number(income),
        noteDate: noteDate,
        description: description || '',
        updateTime: db.serverDate()
      }
      const res = await db.collection(COLLECTION)
        .where({ _id: id, openId: wxContext.OPENID })
        .update({ data })
      return res.stats.updated > 0
        ? { code: 1, data: res, message: '修改成功' }
        : { code: -1, message: '无权限或记录不存在' }
    }

    // 逻辑删除（必须校验 openId）
    if (mode === 'deleteById') {
      if (!id) return { code: -1, message: '记录 ID 不能为空' }
      const res = await db.collection(COLLECTION)
        .where({ _id: id, openId: wxContext.OPENID })
        .update({ data: { isDel: true, updateTime: db.serverDate() } })
      return res.stats.updated > 0
        ? { code: 1, data: res, message: '删除成功' }
        : { code: -1, message: '无权限或记录不存在' }
    }

    return { code: -1, message: '未知操作模式' }
  } catch (e) {
    return { code: -1, data: e, message: '操作失败' }
  }
}
