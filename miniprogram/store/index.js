// 工时记录小程序 - 全局状态
export default {
  data: {
    sysInfo: {},
    currentMonthData: {},        // 当前月统计 { daily, summary }
    pickDateListSumResult: [0, 0], // [总工时, 总收入]
    editBill: {},                // 正在编辑的记录
    showTabbar: true,
    activeTab: 'index',
    isEdit: false,
    shouldFetchList: false,
    selectedDate: ''             // 当前选中的日期
  },
  debug: true,
}
