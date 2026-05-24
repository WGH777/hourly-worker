// 工时记录列表组件
import dayjs from 'dayjs'

const { importStore } = getApp()
const { create, store } = importStore
let dateRange = null

create.Component(store, {
  options: { styleIsolation: 'shared' },
  use: ['sysInfo.screenHeight', 'sysInfo.statusBarHeight', 'currentMonthData'],
  properties: { tab: String },
  data: {
    billResult: [],
    totalHours: 0,
    totalIncome: 0,
    today: '',
    showMenuDialog: false,
    editItem: {},
    showConfirmDelete: false
  },
  ready() {
    const now = dayjs().format('YYYY-MM-DD')
    this.getBillList(now, now)
    this.setData({ today: now })
  },
  methods: {
    // 获取工时记录列表
    getBillList(startDate, endDate) {
      const self = this
      wx.showLoading({ title: '加载中...' })

      const data = { page: 1, limit: 200, startDate, endDate }
      if (dateRange) {
        data.startDate = dateRange[0]
        data.endDate = dateRange[1]
      }

      wx.cloud.callFunction({
        name: 'getAccountList',
        data,
        success(res) {
          if (res.result && res.result.code === 1) {
            const list = res.result.data.list || []
            let totalH = 0, totalI = 0
            list.forEach(item => {
              totalH += item.hours || 0
              totalI += item.income || 0
            })
            self.setData({
              billResult: list,
              totalHours: Math.round(totalH * 100) / 100,
              totalIncome: Math.round(totalI * 100) / 100
            })
            store.data.pickDateListSumResult = [totalH, totalI]
          } else {
            self.setData({ billResult: [], totalHours: 0, totalIncome: 0 })
          }
        },
        fail() {
          wx.showToast({ title: '加载失败', icon: 'none' })
        },
        complete() { wx.hideLoading() }
      })
    },
    // 编辑记录
    editRecord(e) {
      const item = e.currentTarget.dataset.item
      store.data.editBill = item
      store.data.isEdit = true
      store.data.activeTab = 'index'
      // 通知 tab 页面切换
      this.triggerEvent('switchTab', 'index')
      // 延迟触发编辑模式让组件 ready
      setTimeout(() => {
        this.triggerEvent('editBill', item)
      }, 300)
    },
    // 删除记录
    deleteRecord(e) {
      const self = this
      const id = e.currentTarget.dataset.id
      wx.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        success(m) {
          if (m.confirm) {
            wx.cloud.callFunction({
              name: 'account',
              data: { mode: 'deleteById', id },
              success(res) {
                if (res.result.code === 1) {
                  wx.showToast({ title: '已删除', icon: 'none' })
                  self.triggerEvent('reFetchBillList')
                }
              }
            })
          }
        }
      })
    },
    onRangePick(event) {
      dateRange = event.detail
      this.getBillList(event.detail[0], event.detail[1])
    },
    onControl(event) {
      if (event.detail.mode === 'reset') {
        dateRange = null
        this.getBillList(this.data.today, this.data.today)
      }
    },
    reFetchBillList() {
      this.triggerEvent('reFetchBillList')
    },
    switchTab() {
      this.triggerEvent('switchTab', 'index')
    },
    closeDialog() {
      this.setData({ showMenuDialog: false, showConfirmDelete: false })
      this.triggerEvent('hideTab', false)
    }
  }
})
