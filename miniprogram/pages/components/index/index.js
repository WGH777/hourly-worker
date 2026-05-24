// 工时记录录入组件
import dayjs from 'dayjs'

const { importStore } = getApp()
const { create, store } = importStore

create.Component(store, {
  options: { styleIsolation: 'shared' },
  properties: {
    isEdit: Boolean
  },
  use: ['editBill'],
  data: {
    hours: '',
    hourlyRate: '',
    note: '',
    calculatedIncome: 0,
    active_date: '今天',
    active_date_time: '',
    loading: false,
    defaultRate: 0
  },
  ready() {
    const date = dayjs().format('YYYY-MM-DD')
    this.setData({ active_date_time: date })

    // 读取用户默认时薪
    const rate = wx.getStorageSync('defaultHourlyRate')
    if (rate) {
      this.setData({ defaultRate: rate, hourlyRate: String(rate) })
    }
  },
  methods: {
    // 工时输入
    onHoursInput(e) {
      const hours = e.detail.value
      this.setData({ hours })
      this.calcIncome()
    },
    // 时薪输入
    onRateInput(e) {
      const rate = e.detail.value
      this.setData({ hourlyRate: rate })
      // 自动记忆时薪
      if (rate && Number(rate) > 0) {
        wx.setStorageSync('defaultHourlyRate', Number(rate))
      }
      this.calcIncome()
    },
    // 备注输入
    onNoteInput(e) {
      this.setData({ note: e.detail.value })
    },
    // 自动计算收入
    calcIncome() {
      const h = parseFloat(this.data.hours) || 0
      const r = parseFloat(this.data.hourlyRate) || this.data.defaultRate || 0
      const income = Math.round(h * r * 100) / 100
      this.setData({ calculatedIncome: income })
    },
    // 快捷时薪按钮
    setRate(e) {
      const rate = e.currentTarget.dataset.rate
      this.setData({ hourlyRate: String(rate), defaultRate: rate })
      wx.setStorageSync('defaultHourlyRate', rate)
      this.calcIncome()
    },
    // 日期切换
    bindDatePicker() {
      const self = this
      wx.showActionSheet({
        itemList: ['今天', '昨天', '前天', '选择日期'],
        success(res) {
          const today = dayjs()
          let date
          switch (res.tapIndex) {
            case 0: date = today.format('YYYY-MM-DD')
              self.setData({ active_date: '今天', active_date_time: date }); break
            case 1: date = today.subtract(1, 'day').format('YYYY-MM-DD')
              self.setData({ active_date: '昨天', active_date_time: date }); break
            case 2: date = today.subtract(2, 'day').format('YYYY-MM-DD')
              self.setData({ active_date: '前天', active_date_time: date }); break
            case 3:
              // 用原生日期选择器
              wx.showModal({
                title: '输入日期',
                editable: true,
                placeholderText: today.format('YYYY-MM-DD'),
                success(m) {
                  if (m.confirm && m.content && /^\d{4}-\d{2}-\d{2}$/.test(m.content)) {
                    self.setData({ active_date: m.content, active_date_time: m.content })
                  }
                }
              })
              break
          }
        }
      })
    },
    // 提交表单
    submitForm() {
      const { hours, hourlyRate, note, active_date_time, calculatedIncome, loading, isEdit } = this.data
      const { editBill } = this.store.data

      if (loading) return

      const h = parseFloat(hours)
      if (!hours || isNaN(h) || h <= 0) {
        wx.showToast({ title: '请输入有效工时', icon: 'none' })
        return
      }

      const rate = parseFloat(hourlyRate) || this.data.defaultRate || 0
      const income = calculatedIncome

      this.setData({ loading: true })

      wx.cloud.callFunction({
        name: 'account',
        data: {
          mode: isEdit ? 'updateById' : 'add',
          hours: h,
          hourlyRate: rate,
          income: income,
          noteDate: active_date_time,
          description: note,
          id: isEdit ? editBill._id : ''
        },
        success: (res) => {
          if (res.result.code === 1) {
            wx.showToast({ title: isEdit ? '已更新' : '记录成功 ✨', icon: 'none' })
            this.resetForm()
            this.triggerEvent('reFetchBillList')
          } else {
            wx.showToast({ title: '保存失败', icon: 'none' })
          }
        },
        complete: () => {
          this.setData({ loading: false })
        }
      })
    },
    // 重置表单
    resetForm() {
      this.setData({
        hours: '',
        note: '',
        calculatedIncome: 0,
        active_date: '今天',
        active_date_time: dayjs().format('YYYY-MM-DD'),
        loading: false
      })
      store.data.editBill = {}
      store.data.isEdit = false
    },
    // tab.js 调用，进入编辑模式
    deactiveEdit() {
      const { editBill } = this.store.data
      if (!editBill || !editBill._id) return
      this.setData({
        hours: String(editBill.hours || ''),
        hourlyRate: String(editBill.hourlyRate || ''),
        note: editBill.description || '',
        active_date: editBill.noteDate || '今天',
        active_date_time: editBill.noteDate || dayjs().format('YYYY-MM-DD'),
        calculatedIncome: editBill.income || 0
      })
    }
  }
})
