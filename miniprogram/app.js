// 工时记账小程序入口
import createStore from './store/omix/create'
import store from './store/index'

App({
  importStore: { create: createStore, store },
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库')
    } else {
      wx.cloud.init({ traceUser: true, env: 'your-cloud-env-id' })
    }

    wx.getSystemInfo({
      success: (res) => {
        store.data.sysInfo = res
      }
    })
  },
  showError(title = '请求失败，请稍后再试') {
    wx.showToast({ title, icon: 'none' })
  }
})
