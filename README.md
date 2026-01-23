# 幸运抽奖系统，纯前端方案
## 简介
基于 Vue3 + Element Plus + Dexie 实现的大屏抽奖方案，无后端支持，纯前端方案。用户的数据只会保存在浏览器的 IndexedDB 中，不会被发送到服务器。非常适用于需要在大屏上展示抽奖结果的场景，如年会抽奖、抽奖游戏等。

## 使用方法
用户通过Excel模板导入抽奖信息、奖品信息、抽奖人员名单，即可在浏览器中进行抽奖操作。无需技术人员支持，简单方便。

### 一、管理后台导入抽奖数据
打开页面 [https://easy-basics.github.io/lottery-frontend/#/admin/lotteryActivity](https://easy-basics.github.io/lottery-frontend/#/admin/lotteryActivity) 新增活动 > 下载Excel模板 > 上传Excel文件 > 保存


### 二、抽奖操作
选择已导入的抽奖活动 > 选择抽奖到达抽奖活动大屏页面 > 选择要开始的抽奖活动 > 点击开始抽奖




