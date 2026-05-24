// 工时记录录入组件 - 原生 Component
const app = getApp()

Component({
  options: { styleIsolation: 'shared' },
  properties: {
    isEdit: Boolean,
    editBill: Object
  },
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
  observers: {
    'isEdit, editBill'(isEdit, editBill) {
      if (isEdit && editBill && editBill._id) {
        this.setData({
          hours: String(editBill.hours || ''),
          hourlyRate: String(editBill.hourlyRate || ''),
          note: editBill.description || '',
          active_date: editBill.noteDate || '今天',
          active_date_time: editBill.noteDate || '',
          calculatedIncome: editBill.income || 0
        })
      }
    }
  },
  lifetimes: {
    ready() {
      const now = this.formatDate(new Date())
      this.setData({ active_date_time: now })
      const rate = wx.getStorageSync('defaultHourlyRate')
      if (rate) {
        this.setData({ defaultRate: rate, hourlyRate: String(rate) })
      }
    }
  },
  methods: {
    onHoursInput(e) {
      this.setData({ hours: e.detail.value })
      this.calcIncome()
    },
    onRateInput(e) {
      const rate = e.detail.value
      this.setData({ hourlyRate: rate })
      if (rate && Number(rate) > 0) {
        wx.setStorageSync('defaultHourlyRate', Number(rate))
      }
      this.calcIncome()
    },
    onNoteInput(e) {
      this.setData({ note: e.detail.value })
    },
    calcIncome() {
      const h = parseFloat(this.data.hours) || 0
      const r = parseFloat(this.data.hourlyRate) || this.data.defaultRate || 0
      const income = Math.round(h * r * 100) / 100
      this.setData({ calculatedIncome: income })
    },
    setRate(e) {
      const rate = e.currentTarget.dataset.rate
      this.setData({ hourlyRate: String(rate), defaultRate: rate })
      wx.setStorageSync('defaultHourlyRate', rate)
      this.calcIncome()
    },
    bindDatePicker() {
      const self = this
      const today = new Date()
      wx.showActionSheet({
        itemList: ['今天', '昨天', '前天', '选择日期'],
        success(res) {
          let d
          switch (res.tapIndex) {
            case 0: d = today; self.setData({ active_date: '今天' }); break
            case 1: d = new Date(today.getTime() - 86400000); self.setData({ active_date: '昨天' }); break
            case 2: d = new Date(today.getTime() - 172800000); self.setData({ active_date: '前天' }); break
            case 3:
              wx.showModal({
                title: '输入日期', editable: true,
                placeholderText: self.formatDate(today),
                success(m) {
                  if (m.confirm && m.content && /^\d{4}-\d{2}-\d{2}$/.test(m.content)) {
                    self.setData({ active_date: m.content, active_date_time: m.content })
                  }
                }
              })
              return
          }
          self.setData({ active_date_time: self.formatDate(d) })
        }
      })
    },
    submitForm() {
      const { hours, hourlyRate, note, active_date_time, calculatedIncome, loading } = this.data
      if (loading) return

      const h = parseFloat(hours)
      if (!hours || isNaN(h) || h <= 0) {
        wx.showToast({ title: '请输入有效工时', icon: 'none' })
        return
      }

      const rate = parseFloat(hourlyRate) || this.data.defaultRate || 0
      const income = calculatedIncome

      this.setData({ loading: true })

      const isEdit = this.properties.isEdit
      const editBill = this.properties.editBill
      const store = app.importStore.store

      wx.cloud.callFunction({
        name: 'account',
        data: {
          mode: isEdit ? 'updateById' : 'add',
          hours: h,
          hourlyRate: rate,
          income: income,
          noteDate: active_date_time,
          description: note,
          id: isEdit && editBill ? editBill._id : ''
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
    resetForm() {
      this.setData({
        hours: '', note: '', calculatedIncome: 0,
        active_date: '今天', active_date_time: this.formatDate(new Date()), loading: false
      })
      const store = app.importStore.store
      store.data.editBill = {}
      store.data.isEdit = false
    },
    formatDate(d) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${y}-${m}-${day}`
    }
  }
})
