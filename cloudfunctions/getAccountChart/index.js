// 云函数：工时月度统计
const cloud = require('wx-server-sdk')
cloud.init()

const COLLECTION = 'HOURLY_RECORD'

exports.main = async (event) => {
  const wxContext = cloud.getWXContext()
  const env = wxContext.ENV
  cloud.updateConfig({ env })
  const db = cloud.database({ env })
  const $ = db.command.aggregate
  const _ = db.command

  const { mode, date } = event // date: "YYYY-MM"

  try {
    // 查询当月每日工时 + 收入汇总
    if (mode === 'getMonthlyStats') {
      const res = await db.collection(COLLECTION)
        .aggregate()
        .addFields({
          formatDate: $.dateToString({ date: '$noteDate', format: '%Y-%m' }),
          noteDay: $.dateToString({ date: '$noteDate', format: '%d' })
        })
        .match({
          openId: wxContext.OPENID,
          formatDate: date,
          isDel: false
        })
        .group({
          _id: '$noteDay',
          totalHours: $.sum('$hours'),
          totalIncome: $.sum('$income'),
          recordCount: $.sum(1)
        })
        .project({
          _id: 0,
          day: '$_id',
          hours: '$totalHours',
          income: '$totalIncome',
          count: '$recordCount'
        })
        .sort({ day: 1 })
        .end()

      // 补齐当月所有天数
      const [year, month] = date.split('-').map(Number)
      const lastDay = new Date(year, month, 0).getDate()

      const dayMap = {}
      for (const row of res.list) {
        dayMap[parseInt(row.day)] = row
      }

      const dailyStats = []
      let monthTotalHours = 0
      let monthTotalIncome = 0
      let workDays = 0

      for (let d = 1; d <= lastDay; d++) {
        const day = d < 10 ? `0${d}` : `${d}`
        const key = `${date}-${day}`
        const record = dayMap[d]
        const hours = record ? record.hours : 0
        const income = record ? record.income : 0
        if (hours > 0) workDays++

        dailyStats.push({
          date: key,
          hours: hours,
          income: income
        })

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
