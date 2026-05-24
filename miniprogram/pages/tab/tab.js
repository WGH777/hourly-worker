// 主页面 - 原生 Page（去掉 omix，确保稳定渲染）
const app = getApp()

Page({
  data: {
    statusBarHeight: 20,
    activeTab: 'index',
    showTabbar: true,
    monthSummary: {},
    chartData: {},
    chartMonth: '',
    maxHours: 8,
    isEdit: false,
    editBill: {}
  },

  onLoad() {
    const now = this.formatMonth(new Date())
    this.setData({ chartMonth: now })
    this.fetchMonthlyStats(now)

    // 同步 store 默认值
    const store = app.importStore.store
    store.data.activeTab = 'index'
  },

  onShow() {
    const store = app.importStore.store
    if (store.data.isEdit) {
      this.setData({ isEdit: true, editBill: store.data.editBill })
    }
    if (store.data.shouldFetchList) {
      this.onReFetchBillList()
      store.data.shouldFetchList = false
    }
  },

  goTo(e) {
    const active = e.currentTarget.dataset.active
    this.setData({ activeTab: active })
    const store = app.importStore.store
    store.data.activeTab = active
    wx.vibrateShort()
  },

  onReFetchBillList() {
    const list = this.selectComponent('#list')
    if (list) {
      const now = this.formatDate(new Date())
      list.getBillList(now, now)
    }
    this.fetchMonthlyStats(this.formatMonth(new Date()))
  },

  onRangePick(e) {
    const list = this.selectComponent('#list')
    if (list) list.onRangePick(e)
  },

  onControl(e) {
    const list = this.selectComponent('#list')
    if (list && e.detail.mode === 'reset') list.onControl(e)
  },

  onPickDateChange(e) {
    const list = this.selectComponent('#list')
    if (list) list.getBillList(e.detail, e.detail)
  },

  onHideTab(e) {
    this.setData({ showTabbar: !e.detail })
  },

  onSwitchTab(e) {
    this.setData({ activeTab: e.detail || 'index' })
    const store = app.importStore.store
    store.data.activeTab = e.detail || 'index'
  },

  onEditBill(e) {
    const store = app.importStore.store
    store.data.editBill = e.detail
    store.data.isEdit = true
    this.setData({ activeTab: 'index', isEdit: true, editBill: e.detail })
  },

  fetchMonthlyStats(month) {
    wx.cloud.callFunction({
      name: 'getAccountChart',
      data: { mode: 'getMonthlyStats', date: month },
      success: (res) => {
        if (res.result && res.result.code === 1) {
          const data = res.result.data
          const maxH = Math.max(8, ...(data.daily || []).map(d => d.hours))
          this.setData({
            chartData: data,
            maxHours: maxH,
            monthSummary: data.summary || {}
          })
          const store = app.importStore.store
          store.data.currentMonthData = data
        }
      }
    })
  },

  pickChartMonth() {
    const items = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      items.push(this.formatMonth(d))
    }
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        const month = items[res.tapIndex]
        this.setData({ chartMonth: month })
        this.fetchMonthlyStats(month)
      }
    })
  },

  formatMonth(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
  },

  formatDate(d) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },

  onShareAppMessage() {
    return {
      title: '工时记账 — 记录每一份付出',
      path: '/pages/tab/tab'
    }
  }
})
