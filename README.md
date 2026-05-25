# ⏱ 工时记账 — 微信小程序

轻量级工时记录与收入统计工具，专为小时工、兼职、自由职业者设计。

基于 [单单记账](https://github.com/GzhiYi/dandan-account) (MIT) 改造。

## ✨ 功能

- ⏱ **工时录入** — 输入工时 + 时薪，自动计算当日收入
- 📅 **日历视图** — 按月查看，日期区间筛选
- 📊 **月度统计** — 总工时 / 总收入 / 工作天数，柱状图可视化
- 🔍 **搜索** — 按关键词搜索历史记录
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
前往 [微信公众平台](https://mp.weixin.qq.com) 注册小程序账号，获取 **AppID**。

### 2. 拉取项目
```bash
git clone https://github.com/WGH777/hourly-worker.git
cd hourly-worker
```

用微信开发者工具打开项目根目录。

### 3. 修改配置

**`project.config.json`** — 填入你的 AppID：
```json
"appid": "你的小程序AppID"
```

**`miniprogram/app.js`** — 填入你的云环境 ID：
```javascript
wx.cloud.init({ traceUser: true, env: 'your-cloud-env-id' })
```

### 4. 开启云开发

微信开发者工具 → 云开发 → 开通 → 创建环境 → 记录环境 ID（填入上一步）。

### 5. 创建数据库集合

云开发控制台 → 数据库 → 添加集合 → `HOURLY_RECORD`

设置权限：**仅创建者可读写**（或自定义规则校验 openId）。

### 6. 上传云函数

右键 `cloudfunctions/` 下每个云函数 → **上传并部署：云端安装依赖**：

| 云函数 | 用途 |
|--------|------|
| `account` | 工时记录 CRUD（add / updateById / deleteById） |
| `getAccountList` | 列表查询（支持日期范围） |
| `getAccountChart` | 月度统计汇总 |

### 7. 构建 npm

微信开发者工具 → 工具 → 构建 npm → 编译预览。

## 🗄 数据模型

```
HOURLY_RECORD
├── _id          string  记录 ID（自动生成）
├── hours        number  工时（小时）
├── hourlyRate   number  时薪（元/时）
├── income       number  当日收入（元）
├── noteDate     string  日期 YYYY-MM-DD（字符串，非 Date 对象）
├── description  string  备注
├── openId       string  用户标识
├── isDel        boolean 逻辑删除标记
├── createTime   Date    创建时间
└── updateTime   Date    更新时间
```

> **注意**：`noteDate` 为 `YYYY-MM-DD` 格式字符串，不是 `Date` 对象。云函数使用字符串字典序比较（等价于时间序），不依赖 `dateToString` 聚合操作符。

## 📁 项目结构

```
hourly-worker/
├── miniprogram/                    # 小程序前端
│   ├── app.js                      # 入口（云环境配置在此）
│   ├── app.json                    # 页面注册
│   ├── app.wxss                    # 全局样式
│   ├── pages/
│   │   ├── tab/                    # 主页面（三 Tab：录入/记录/统计）
│   │   ├── search/                 # 搜索页
│   │   ├── setting/                # 设置页
│   │   └── components/             # 通用组件
│   │       ├── calendar/           # 日历组件
│   │       ├── index/              # 工时录入组件
│   │       ├── list/               # 记录列表组件
│   │       └── nav/                # 导航栏组件
│   ├── store/
│   │   ├── index.js                # 全局状态 store
│   │   └── omix/                   # omix 响应式框架
│   ├── images/                     # 图标资源
│   └── miniprogram_npm/            # 构建产物（gitignore）
├── cloudfunctions/                 # 云函数
│   ├── account/                    # 工时 CRUD
│   ├── getAccountList/             # 列表查询
│   └── getAccountChart/            # 月度统计
├── project.config.json             # 微信项目配置
├── package.json                    # 项目元信息 & npm 依赖
└── README.md
```

## ✅ 部署检查清单

在首次部署或迁移环境时，逐项确认：

- [ ] **AppID** — `project.config.json` 中的 `appid` 已替换为你的小程序 AppID
- [ ] **云环境 ID** — `miniprogram/app.js` 中 `env` 已替换为你的云环境 ID
- [ ] **云开发开通** — 微信开发者工具中已开通云开发并创建环境
- [ ] **数据库集合** — `HOURLY_RECORD` 集合已创建，权限设为仅创建者可读写
- [ ] **云函数上传** — 三个云函数均已右键上传并部署（含云端安装依赖）
- [ ] **npm 构建** — 工具 → 构建 npm，确认 `miniprogram_npm/` 目录已生成
- [ ] **基础库版本** — `project.config.json` 中 `libVersion` ≥ 2.2.3
- [ ] **编译预览** — 点击编译，模拟器正常显示无报错
- [ ] **真机测试** — 扫码测试录入/查询/统计功能完整可用

## 📄 许可

MIT License — 继承自 [单单记账](https://github.com/GzhiYi/dandan-account)
