Page({
  data: { keyword: '', results: [], isSearching: false, isFocus: true },
  onInputChange(e) {
    this.setData({ keyword: e.detail.value })
  },
  confirmTap() {
    const keyword = this.data.keyword
    if (!keyword) return
    this.setData({ isSearching: true })
    wx.cloud.callFunction({
      name: 'getAccountList',
      data: { page: 1, limit: 200, startDate: '2020-01-01', endDate: '2099-12-31' },
      success: (res) => {
        if (res.result && res.result.code === 1) {
          const list = res.result.data.list || []
          const filtered = list.filter(item =>
            (item.description || '').includes(keyword) ||
            (item.noteDate || '').includes(keyword) ||
            String(item.hours).includes(keyword)
          )
          this.setData({ results: filtered, isSearching: false })
        }
      },
      fail: () => {
        this.setData({ isSearching: false })
      }
    })
  },
  onItemTap(e) {
    wx.navigateBack()
  }
})
