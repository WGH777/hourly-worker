// 云函数：获取工时记录列表 + 月度统计
const cloud = require('wx-server-sdk')
cloud.init()

const COLLECTION = 'HOURLY_RECORD'

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV
  cloud.updateConfig({ env })
  const db = cloud.database({ env })
  const _ = db.command

  const { page = 1, limit = 100, startDate, endDate } = event

  try {
    const basicWhere = {
      isDel: false,
      openId: _.eq(wxContext.OPENID),
      noteDate: _.gte(startDate).and(_.lte(endDate))
    }

    // 总记录数
    const totalRes = await db.collection(COLLECTION).where(basicWhere).count()
    const total = totalRes.total

    // 分页查询
    const offset = (page - 1) * limit
    const listRes = await db.collection(COLLECTION)
      .where(basicWhere)
      .skip(offset)
      .limit(limit)
      .orderBy('noteDate', 'desc')
      .orderBy('createTime', 'desc')
      .get()

    return {
      code: 1,
      data: { list: listRes.data, total },
      message: 'ok'
    }
  } catch (e) {
    return { code: -1, data: { list: [], total: 0 }, message: String(e) }
  }
}
