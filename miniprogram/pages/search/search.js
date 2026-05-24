Page({
  data: { keyword: '', results: [] },
  onSearch(e) {
    const keyword = e.detail.value
    if (!keyword) return
    wx.cloud.callFunction({
      name: 'getAccountList',
      data: { page: 1, limit: 200, startDate: '2020-01-01', endDate: '2099-12-31' },
      success: (res) => {
        if (res.result.code === 1) {
          const list = res.result.data.list || []
          const filtered = list.filter(item =>
            (item.description || '').includes(keyword) ||
            (item.noteDate || '').includes(keyword) ||
            String(item.hours).includes(keyword)
          )
          this.setData({ results: filtered })
        }
      }
    })
  },
  onItemTap(e) {
    wx.navigateBack()
  }
})
