Component({
  options: { styleIsolation: 'shared' },
  properties: {
    showIcons: { type: Array, value: [] },
    title: { type: String, value: '' },
    showBackIcon: { type: Boolean, value: false },
    showSearch: { type: Boolean, value: false },
    showSetting: { type: Boolean, value: false },
    showIssue: { type: Boolean, value: false },
    showBannerSetting: { type: Boolean, value: false },
    statusBarHeight: { type: Number, value: 20 }
  },
  data: {},
  observers: {
    'showIcons'(icons) {
      if (!icons || !icons.length) return
      const flags = {}
      icons.forEach(function(icon) {
        if (icon === 'back') flags.showBackIcon = true
        if (icon === 'search') flags.showSearch = true
        if (icon === 'setting') flags.showSetting = true
        if (icon === 'issue') flags.showIssue = true
      })
      if (Object.keys(flags).length) this.setData(flags)
    }
  },
  methods: {
    back() { wx.navigateBack() },
    goTo(e) {
      var page = e.currentTarget.dataset.page
      if (page) wx.navigateTo({ url: '/pages/' + page + '/' + page })
    },
    goTotarget() {},
    showBanner() {}
  }
})
