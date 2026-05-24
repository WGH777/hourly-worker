# ⏱ 工时记账 — 微信小程序

轻量级工时记录与收入统计工具，专为小时工、兼职、自由职业者设计。

基于 [单单记账](https://github.com/GzhiYi/dandan-account) (MIT) 改造。

## ✨ 功能

- ⏱ **工时录入** — 输入工时 + 时薪，自动计算当日收入
- 📅 **日历视图** — 按月查看，有记录的日期高亮显示
- 📊 **月度统计** — 总工时 / 总收入 / 工作天数，柱状图可视化
- 💾 **云同步** — 基于微信云开发，数据不丢失
- 🎨 **深色主题** — 沉浸式界面，护眼舒适

## 🏗 技术栈

| 层 | 技术 |
|---|------|
| 前端 | 微信小程序原生 |
| 状态管理 | omix |
| 后端 | 微信云开发 (CloudBase) |
| 数据库 | 云开发文档型数据库 |
| 图表 | 纯 CSS 柱状图 |

## 🚀 快速开始

### 1. 注册小程序
前往 [微信公众平台](https://mp.weixin.qq.com) 注册小程序账号，获取 AppID。

### 2. 开启云开发
在微信开发者工具中 → 云开发 → 开通 → 记录环境 ID。

### 3. 修改配置

```javascript
// miniprogram/app.js 第 15 行
env: '你的云环境ID'
```

```json
// project.config.json
"appid": "你的小程序AppID"
```

### 4. 创建数据库集合

云开发控制台 → 数据库 → 添加集合 → `HOURLY_RECORD`

### 5. 上传云函数

右键 `cloudfunctions/` 下三个云函数，分别上传并部署：
- `account` — 工时记录 CRUD
- `getAccountList` — 列表查询
- `getAccountChart` — 月度统计

### 6. 编译预览

点「编译」→ 模拟器预览 → 手机扫码测试。

## 🗄 数据模型

```
HOURLY_RECORD
├── hours       number  工时（小时）
├── hourlyRate  number  时薪（元/时）
├── income      number  当日收入（元）
├── noteDate    string  日期 YYYY-MM-DD
├── description string  备注
├── openId      string  用户标识
└── isDel       boolean 逻辑删除
```

## 📁 项目结构

```
├── miniprogram/          # 小程序前端
│   ├── pages/tab/        # 主页面（三Tab）
│   ├── components/
│   │   ├── index/        # 工时录入组件
│   │   ├── list/         # 记录列表组件
│   │   └── calendar/     # 日历组件
│   └── store/            # 全局状态
├── cloudfunctions/       # 云函数
│   ├── account/          # CRUD
│   ├── getAccountList/   # 查询
│   └── getAccountChart/  # 统计
└── project.config.json
```

## 📄 许可

MIT License — 继承自 [单单记账](https://github.com/GzhiYi/dandan-account)
