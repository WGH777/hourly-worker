// 工时记录列表组件 - 原生 Component
const app = getApp()
let dateRange = null

Component({
  options: { styleIsolation: 'shared' },
  properties: { tab: String },
  data: {
    billResult: [],
    totalHours: 0,
    totalIncome: 0,
    today: ''
  },
  lifetimes: {
    ready() {
      const now = this.formatDate(new Date())
      this.setData({ today: now })
      this.getBillList(now, now)
    }
  },
  methods: {
    getBillList(startDate, endDate) {
      wx.showLoading({ title: '加载中...' })
      const data = { page: 1, limit: 200, startDate, endDate }
      if (dateRange) {
        data.startDate = dateRange[0]
        data.endDate = dateRange[1]
      }
      wx.cloud.callFunction({
        name: 'getAccountList',
        data,
        success: (res) => {
          if (res.result && res.result.code === 1) {
            const list = res.result.data.list || []
            let totalH = 0, totalI = 0
            list.forEach(item => {
              totalH += item.hours || 0
              totalI += item.income || 0
            })
            this.setData({
              billResult: list,
              totalHours: Math.round(totalH * 100) / 100,
              totalIncome: Math.round(totalI * 100) / 100
            })
            const store = app.importStore.store
            store.data.pickDateListSumResult = [totalH, totalI]
          }
        },
        complete() { wx.hideLoading() }
      })
    },
    editRecord(e) {
      const item = e.currentTarget.dataset.item
      const store = app.importStore.store
      store.data.editBill = item
      store.data.isEdit = true
      this.triggerEvent('switchTab', 'index')
      setTimeout(() => {
        this.triggerEvent('editBill', item)
      }, 100)
    },
    deleteRecord(e) {
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success: (m) => {
          if (m.confirm) {
            wx.cloud.callFunction({
              name: 'account',
              data: { mode: 'deleteById', id },
              success: (res) => {
                if (res.result.code === 1) {
                  wx.showToast({ title: '已删除', icon: 'none' })
                  this.triggerEvent('reFetchBillList')
                }
              }
            })
          }
        }
      })
    },
    onRangePick(e) {
      dateRange = e.detail
      this.getBillList(e.detail[0], e.detail[1])
    },
    onControl(e) {
      if (e.detail.mode === 'reset') {
        dateRange = null
        this.getBillList(this.data.today, this.data.today)
      }
    },
    switchTab() {
      this.triggerEvent('switchTab', 'index')
    },
    formatDate(d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  }
})
