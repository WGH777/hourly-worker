import createStore from './store/omix/create'
import store from './store/index'

App({
  importStore: {
    create: createStore,
    store
  },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
        env: 'dandan-zdm86'
      })
    }

    wx.getSystemInfo({
      success: (res) => {
        store.data.sysInfo = res
      }
    })
  },
  showError(title = '请求失败，请稍后再试') {
    wx.showToast({ title, icon: 'none' })
  },
  enterEditMode(ctx) {
    const index = ctx.selectComponent('#index')
    index.deactiveEdit()
  }
})
