// 云函数：获取工时记录列表
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

const COLLECTION = 'HOURLY_RECORD'

exports.main = async (event = {}) => {
  try {
    const wxContext = cloud.getWXContext()

    const page = Number(event.page || 1)
    const limit = Number(event.limit || 50)

    const {
      startDate,
      endDate
    } = event

    const whereData = {
      isDel: false,
      openId: wxContext.OPENID
    }

    // 日期筛选
    if (startDate && endDate) {
      whereData.noteDate = _.gte(startDate).and(_.lte(endDate))
    }

    const offset = (page - 1) * limit

    // 只查列表
    const res = await db
      .collection(COLLECTION)
      .where(whereData)
      .orderBy('createTime', 'desc')
      .skip(offset)
      .limit(limit)
      .get()

    return {
      code: 1,
      data: {
        list: res.data || [],
        total: res.data.length
      },
      message: 'success'
    }

  } catch (err) {

    console.error('getAccountList error:', err)

    return {
      code: -1,
      data: {
        list: [],
        total: 0
      },
      message: err.message || '服务器异常'
    }
  }
}