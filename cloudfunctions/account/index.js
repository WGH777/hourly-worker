// 云函数：工时记录 CRUD
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

    // 更新一条记录
    if (mode === 'updateById') {
      const data = {
        hours: Number(hours),
        hourlyRate: Number(hourlyRate || 0),
        income: Number(income),
        noteDate: noteDate,
        description: description || '',
        updateTime: db.serverDate()
      }
      const res = await db.collection(COLLECTION).doc(id).update({ data })
      return { code: 1, data: res, message: '修改成功' }
    }

    // 逻辑删除
    if (mode === 'deleteById') {
      const res = await db.collection(COLLECTION).doc(id).update({ data: { isDel: true } })
      return { code: 1, data: res, message: '删除成功' }
    }

    return { code: -1, message: '未知操作模式' }
  } catch (e) {
    return { code: -1, data: e, message: '操作失败' }
  }
}
