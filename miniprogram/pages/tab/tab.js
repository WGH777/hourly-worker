// 主页面 Tab 控制器
import dayjs from 'dayjs'

const { importStore } = getApp()
const { create, store } = importStore

create.Page(store, {
  use: ['sysInfo.screenHeight', 'sysInfo.statusBarHeight', 'currentMonthData', 'editBill', 'showTabbar', 'activeTab', 'isEdit'],
  data: {
    scale: null,
    monthSummary: {},
    chartData: {},
    chartMonth: '',
    maxHours: 8
  },
  onLoad() {
    // 请求月度统计
    const now = dayjs().format('YYYY-MM')
    this.setData({ chartMonth: now })
    this.fetchMonthlyStats(now)
  },
  onShow() {
    const { shouldFetchList } = store.data
    if (shouldFetchList) {
      this.onReFetchBillList()
      store.data.shouldFetchList = false
    }
    // 如果有编辑任务
    if (store.data.isEdit) {
      const index = this.selectComponent('#index')
      if (index) index.deactiveEdit()
    }
  },
  // Tab 切换
  goTo(event) {
    const { active } = event.currentTarget.dataset
    this.setData({ scale: active })
    store.data.activeTab = active
    wx.vibrateShort()
    setTimeout(() => this.setData({ scale: null }), 200)
  },
  // 刷新列表
  onReFetchBillList() {
    const list = this.selectComponent('#list')
    if (list) {
      const now = dayjs().format('YYYY-MM-DD')
      list.getBillList(now, now)
    }
    const now = dayjs().format('YYYY-MM')
    this.fetchMonthlyStats(now)
  },
  // 日历区间选择
  onRangePick(event) {
    const list = this.selectComponent('#list')
    if (list) list.onRangePick(event)
  },
  onControl(event) {
    const list = this.selectComponent('#list')
    if (list && event.detail.mode === 'reset') list.onControl(event)
  },
  onPickDateChange(e) {
    const list = this.selectComponent('#list')
    if (list) list.getBillList(e.detail, e.detail)
  },
  // 隐藏 Tabbar
  onHideTab(e) {
    store.data.showTabbar = !e.detail
  },
  // 切换到录入页
  onSwitchTab(e) {
    store.data.activeTab = e.detail || 'index'
  },
  // 编辑账单
  onEditBill(e) {
    store.data.editBill = e.detail
    store.data.isEdit = true
    store.data.activeTab = 'index'
    setTimeout(() => {
      const index = this.selectComponent('#index')
      if (index) index.deactiveEdit()
    }, 200)
  },
  // 获取月度统计
  fetchMonthlyStats(month) {
    const self = this
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: { mode: 'getMonthlyStats', date: month },
      success(res) {
        if (res.result && res.result.code === 1) {
          const data = res.result.data
          const maxH = Math.max(8, ...(data.daily || []).map(d => d.hours))
          self.setData({
            chartData: data,
            maxHours: maxH,
            monthSummary: data.summary
          })
          store.data.currentMonthData = data
        }
      }
    })
  },
  // 选择统计月份
  pickChartMonth() {
    const self = this
    const items = []
    const now = dayjs()
    for (let i = 0; i < 12; i++) {
      items.push(now.subtract(i, 'month').format('YYYY-MM'))
    }
    wx.showActionSheet({
      itemList: items,
      success(res) {
        const month = items[res.tapIndex]
        self.setData({ chartMonth: month })
        self.fetchMonthlyStats(month)
      }
    })
  },
  onShareAppMessage() {
    return {
      title: '工时记账 — 记录每一份付出',
      path: '/pages/tab/tab'
    }
  }
})
