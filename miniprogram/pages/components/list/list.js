// 工时记录列表组件
import dayjs from 'dayjs'

const { importStore } = getApp()
const { create, store } = importStore

let dateRange = null

create.Component(store, {
  options: {
    styleIsolation: 'shared'
  },

  use: [
    'sysInfo.screenHeight',
    'sysInfo.statusBarHeight',
    'currentMonthData'
  ],

  properties: {
    tab: String
  },

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

    this.setData({
      today: now
    })

    this.getBillList(now, now)
  },

  methods: {
    // 获取工时记录列表
    getBillList(startDate, endDate) {
      const self = this

      const finalStartDate = dateRange ? dateRange[0] : startDate
      const finalEndDate = dateRange ? dateRange[1] : endDate

      wx.showLoading({
        title: '加载中...',
        mask: true
      })

      const data = {
        page: 1,
        limit: 200,
        startDate: finalStartDate,
        endDate: finalEndDate
      }

      wx.cloud.callFunction({
        name: 'getAccountList',
        data,

        success(res) {
          const result = res.result || {}

          if (result.code === 1) {
            const list = result.data && result.data.list
              ? result.data.list
              : []

            let totalH = 0
            let totalI = 0

            const newList = list.map(item => {
              const hours = Number(item.hours) || 0
              const income = Number(item.income) || 0

              totalH += hours
              totalI += income

              return {
                ...item,
                hours,
                income
              }
            })

            const totalHours = Math.round(totalH * 100) / 100
            const totalIncome = Math.round(totalI * 100) / 100

            self.setData({
              billResult: newList,
              totalHours,
              totalIncome
            })

            store.data.pickDateListSumResult = [
              totalHours,
              totalIncome
            ]
          } else {
            self.clearBillList()

            wx.showToast({
              title: result.msg || '暂无数据',
              icon: 'none'
            })
          }
        },

        fail(err) {
          console.error('获取工时记录失败：', err)

          self.clearBillList()

          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        },

        complete() {
          wx.hideLoading()
        }
      })
    },

    // 清空列表数据
    clearBillList() {
      this.setData({
        billResult: [],
        totalHours: 0,
        totalIncome: 0
      })

      store.data.pickDateListSumResult = [0, 0]
    },

    // 编辑记录
    editRecord(e) {
      const item = e.currentTarget.dataset.item

      if (!item) {
        wx.showToast({
          title: '记录不存在',
          icon: 'none'
        })
        return
      }

      store.data.editBill = item
      store.data.isEdit = true
      store.data.activeTab = 'index'

      this.triggerEvent('switchTab', 'index')

      setTimeout(() => {
        this.triggerEvent('editBill', item)
      }, 300)
    },

    // 删除记录
    deleteRecord(e) {
      const self = this
      const id = e.currentTarget.dataset.id

      if (!id) {
        wx.showToast({
          title: '记录ID不存在',
          icon: 'none'
        })
        return
      }

      wx.showModal({
        title: '确认删除',
        content: '删除后不可恢复',
        confirmColor: '#d93025',

        success(m) {
          if (!m.confirm) return

          wx.showLoading({
            title: '删除中...',
            mask: true
          })

          wx.cloud.callFunction({
            name: 'account',
            data: {
              mode: 'deleteById',
              id
            },

            success(res) {
              const result = res.result || {}

              if (result.code === 1) {
                wx.showToast({
                  title: '已删除',
                  icon: 'success'
                })

                self.refreshCurrentList()

                self.triggerEvent('reFetchBillList')
              } else {
                wx.showToast({
                  title: result.msg || '删除失败',
                  icon: 'none'
                })
              }
            },

            fail(err) {
              console.error('删除工时记录失败：', err)

              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            },

            complete() {
              wx.hideLoading()
            }
          })
        }
      })
    },

    // 日期范围选择
    onRangePick(event) {
      const range = event.detail || []

      if (!range[0] || !range[1]) {
        wx.showToast({
          title: '请选择完整日期范围',
          icon: 'none'
        })
        return
      }

      dateRange = range

      this.getBillList(range[0], range[1])
    },

    // 控制事件，例如重置
    onControl(event) {
      const detail = event.detail || {}

      if (detail.mode === 'reset') {
        dateRange = null
        this.getBillList(this.data.today, this.data.today)
      }
    },

    // 刷新当前列表
    refreshCurrentList() {
      if (dateRange) {
        this.getBillList(dateRange[0], dateRange[1])
      } else {
        this.getBillList(this.data.today, this.data.today)
      }
    },

    // 父组件触发刷新
    reFetchBillList() {
      this.refreshCurrentList()
    },

    // 切换到录入页
    switchTab() {
      this.triggerEvent('switchTab', 'index')
    },

    // 关闭弹窗
    closeDialog() {
      this.setData({
        showMenuDialog: false,
        showConfirmDelete: false
      })

      this.triggerEvent('hideTab', false)
    }
  }
})