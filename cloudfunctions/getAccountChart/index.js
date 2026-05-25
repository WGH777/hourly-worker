// 云函数：工时月度统计
// noteDate 为 YYYY-MM-DD 字符串字段，不依赖 dateToString 聚合操作符
const cloud = require('wx-server-sdk')
cloud.init()

const COLLECTION = 'HOURLY_RECORD'

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV
  cloud.updateConfig({ env })
  const db = cloud.database({ env })
  const _ = db.command

  const { mode, date } = event // date: "YYYY-MM"

  try {
    if (mode === 'getMonthlyStats') {
      const [year, month] = date.split('-').map(Number)
      const lastDay = new Date(year, month, 0).getDate()
      const startDate = `${date}-01`
      const endDate = `${date}-${String(lastDay).padStart(2, '0')}`

      // 按月查询：noteDate 为 'YYYY-MM-DD' 字符串，字典序等价于时间序
      const res = await db.collection(COLLECTION)
        .where({
          openId: wxContext.OPENID,
          noteDate: _.gte(startDate).and(_.lte(endDate)),
          isDel: false
        })
        .get()

      // JS 端按日聚合
      const dayMap = {}
      for (const row of res.data) {
        const day = parseInt(row.noteDate.split('-')[2], 10)
        if (!dayMap[day]) {
          dayMap[day] = { hours: 0, income: 0, count: 0 }
        }
        dayMap[day].hours += row.hours || 0
        dayMap[day].income += row.income || 0
        dayMap[day].count += 1
      }

      // 补齐当月所有日期
      const dailyStats = []
      let monthTotalHours = 0
      let monthTotalIncome = 0
      let workDays = 0

      for (let d = 1; d <= lastDay; d++) {
        const dayStr = String(d).padStart(2, '0')
        const key = `${date}-${dayStr}`
        const record = dayMap[d]
        const hours = record ? record.hours : 0
        const income = record ? record.income : 0
        if (hours > 0) workDays++

        dailyStats.push({ date: key, hours, income })
        monthTotalHours += hours
        monthTotalIncome += income
      }

      return {
        code: 1,
        data: {
          daily: dailyStats,
          summary: {
            totalHours: Math.round(monthTotalHours * 100) / 100,
            totalIncome: Math.round(monthTotalIncome * 100) / 100,
            workDays
          }
        }
      }
    }

    return { code: -1, message: '未知模式' }
  } catch (e) {
    return { code: -1, data: null, message: String(e) }
  }
}
