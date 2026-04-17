# 项目概述

## 项目简介

Peroe Mail (Peroe Mail) 是一个基于 Cloudflare 的简约响应式邮箱服务，支持邮件发送、附件收发等功能。只需一个域名，即可创建多个不同的邮箱地址，类似各大邮箱平台。项目可部署到 Cloudflare Workers，降低服务器成本，适合搭建自己的邮箱服务。

## 功能特性

### 核心功能

| 功能 | 说明 |
|------|------|
| 邮件发送 | 集成 Resend/SES，支持群发、内嵌图片、附件发送 |
| 邮件接收 | 支持邮件接收和解析，自动分发到相应账号 |
| 多账号管理 | 一个域名下支持多个邮箱账号 |
| 附件收发 | 支持附件收发，使用 R2 对象存储 |
| 邮件搜索 | 支持多条件搜索邮件 |
| 邮件星标 | 支持标记重要邮件 |
| 邮件归档 | 支持邮件归档管理 |
| 邮件过滤 | 支持自定义过滤规则自动处理邮件 |
| Catch-all 转发 | 支持域名级转发规则 |

### 用户与权限

| 功能 | 说明 |
|------|------|
| 用户注册 | 支持邮箱注册和注册码邀请 |
| 用户登录 | JWT 多 Token 并发支持（最多 10 个） |
| 角色权限 | RBAC 角色权限控制 |
| 两步验证 | TOTP 两步验证支持 |
| OAuth 登录 | 支持 LinuxDo OAuth 登录 |
| 人机验证 | Cloudflare Turnstile 集成 |

### 管理功能

| 功能 | 说明 |
|------|------|
| 用户管理 | 用户 CRUD、状态管理、权限分配 |
| 角色管理 | 自定义角色和权限树 |
| 注册码管理 | 生成和管理邀请码 |
| 系统设置 | 网站配置、邮件配置、SES/Resend 配置 |
| 审计日志 | 记录用户操作行为 |
| 数据分析 | ECharts 可视化统计 |

### 集成功能

| 功能 | 说明 |
|------|------|
| Telegram 推送 | 接收邮件后推送到 TG 机器人 |
| Telegram 频道 | 支持 TG 频道管理，支持话题模式 |
| Webhook | 支持 Resend Webhooks |
| 第三方转发 | 支持转发到其他邮箱服务 |

### 个性化设置

| 功能 | 说明 |
|------|------|
| 网站标题 | 自定义网站标题 |
| 登录背景 | 自定义登录背景图片 |
| 透明度调整 | 调整登录框透明度 |
| 多语言 | 支持中英文切换 |

## 技术架构

### 整体架构

```
                    ┌─────────────────┐
                    │  Cloudflare CDN  │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌──────▼──────┐  ┌───▼────┐
        │  D1 DB    │  │  KV Storage │  │  R2    │
        └───────────┘  └─────────────┘  └────────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼────────┐
                    │  mail-worker    │
                    │ (Cloudflare     │
                    │  Workers)        │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  mail-vue        │
                    │ (Static Assets)  │
                    └─────────────────┘
```

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Cloudflare Workers | - | 运行时环境 |
| Hono | 4.7.5 | Web 框架 |
| Drizzle ORM | 0.42.0 | 数据库 ORM |
| postal-mime | 2.4.3 | 邮件解析 |
| resend | 6.4.1 | 邮件发送 API |
| i18next | 25.3.2 | 国际化 |
| dayjs | 1.11.13 | 日期处理 |
| uuid | 11.1.0 | UUID 生成 |
| linkedom | 0.18.10 | HTML 解析 |
| ua-parser-js | 2.0.3 | User-Agent 解析 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue | 3.5.13 | 框架 |
| Element Plus | 2.13.1 | UI 组件库 |
| Pinia | 3.0.2 | 状态管理 |
| pinia-plugin-persistedstate | 4.2.0 | 状态持久化 |
| Vue Router | 4.5.0 | 路由 |
| Axios | 1.7.8 | HTTP 客户端 |
| ECharts | 5.6.0 | 图表 |
| Vue I18n | 11.1.10 | 国际化 |
| Vite | 7.1.5 | 构建工具 |
| Dexie | 4.0.11 | 本地数据库 |
| TinyMCE | - | 富文本编辑 |

## 目录结构

### 后端 (mail-worker)

```
mail-worker/
├── src/
│   ├── api/                    # API 路由层
│   │   ├── login-api.js       # 登录注册
│   │   ├── email-api.js       # 邮件管理
│   │   ├── account-api.js     # 账号管理
│   │   ├── user-api.js        # 用户管理
│   │   ├── role-api.js        # 角色管理
│   │   ├── setting-api.js     # 系统设置
│   │   ├── star-api.js        # 星标管理
│   │   ├── contact-api.js     # 联系人
│   │   ├── filter-api.js      # 过滤规则
│   │   ├── forward-rule-api.js # 转发规则
│   │   ├── audit-api.js       # 审计日志
│   │   ├── analysis-api.js    # 数据分析
│   │   ├── all-email-api.js   # 全量邮件
│   │   ├── reg-key-api.js     # 注册码
│   │   ├── 2fa-api.js         # 两步验证
│   │   ├── oauth-api.js       # OAuth 登录
│   │   ├── telegram-api.js   # TG 机器人
│   │   ├── tg-channel-api.js # TG 频道
│   │   ├── public-api.js     # 公开 API
│   │   ├── init-api.js       # 数据库初始化
│   │   ├── kv-api.js         # KV 访问
│   │   ├── r2-api.js         # R2 访问
│   │   ├── resend-api.js     # Resend Webhooks
│   │   └── test-api.js       # 测试接口
│   │
│   ├── service/                # 业务服务层
│   │   ├── login-service.js   # 登录服务
│   │   ├── email-service.js   # 邮件服务
│   │   ├── user-service.js    # 用户服务
│   │   ├── account-service.js # 账号服务
│   │   ├── role-service.js   # 角色服务
│   │   ├── setting-service.js # 设置服务
│   │   ├── resend-service.js # Resend API
│   │   ├── ses-service.js    # SES 邮件发送
│   │   ├── queue-service.js  # 队列服务
│   │   ├── att-service.js    # 附件服务
│   │   ├── r2-service.js     # R2 存储
│   │   ├── contact-service.js # 联系人服务
│   │   ├── filter-service.js # 过滤服务
│   │   ├── forward-rule-service.js # 转发服务
│   │   ├── star-service.js   # 星标服务
│   │   ├── audit-service.js  # 审计服务
│   │   ├── oauth-service.js  # OAuth 服务
│   │   ├── telegram-service.js # TG 服务
│   │   ├── tg-channel-service.js # TG 频道
│   │   ├── two-factor-service.js # 2FA 服务
│   │   └── ...
│   │
│   ├── dao/                    # 数据访问层
│   │   └── analysis-dao.js    # 分析数据访问
│   │
│   ├── entity/                 # 数据库实体
│   │   ├── user.js           # 用户表
│   │   ├── email.js          # 邮件表
│   │   ├── account.js        # 账号表
│   │   ├── role.js           # 角色表
│   │   ├── perm.js           # 权限表
│   │   ├── star.js           # 星标表
│   │   ├── att.js            # 附件表
│   │   ├── verify-record.js  # 验证码记录
│   │   ├── reg-key.js        # 注册码
│   │   ├── audit-log.js      # 审计日志
│   │   ├── oauth.js          # OAuth 用户
│   │   ├── contact.js        # 联系人
│   │   ├── filter-rule.js    # 过滤规则
│   │   ├── forward-rule.js   # 转发规则
│   │   ├── setting.js        # 系统设置
│   │   ├── tg-channel.js     # TG 频道
│   │   └── tg-archive.js     # TG 归档
│   │
│   ├── security/              # 安全认证
│   │   ├── security.js      # JWT 中间件
│   │   └── user-context.js  # 用户上下文
│   │
│   ├── email/                 # 邮件处理
│   │   └── email.js         # 邮件接收处理
│   │
│   ├── const/                 # 常量定义
│   │   ├── constant.js       # 通用常量
│   │   ├── entity-const.js   # 业务常量
│   │   └── kv-const.js      # KV Key 常量
│   │
│   ├── utils/                 # 工具类
│   │   ├── jwt-utils.js     # JWT 工具
│   │   ├── crypto-utils.js   # 加密工具
│   │   ├── email-utils.js    # 邮件工具
│   │   ├── file-utils.js     # 文件工具
│   │   ├── req-utils.js      # 请求工具
│   │   └── ...
│   │
│   ├── i18n/                  # 国际化
│   │   ├── i18n.js          # 国际化配置
│   │   ├── zh.js            # 中文翻译
│   │   └── en.js            # 英文翻译
│   │
│   ├── hono/                  # Hono 配置
│   │   ├── hono.js          # Hono 实例
│   │   └── webs.js          # WebSocket（部分）
│   │
│   ├── init/                  # 初始化
│   │   └── init.js          # 数据库迁移
│   │
│   ├── model/                 # 数据模型
│   │   └── result.js        # 响应体封装
│   │
│   ├── error/                 # 错误处理
│   │   └── biz-error.js     # 业务异常
│   │
│   ├── template/              # 模板
│   │   ├── email-html.js    # HTML 邮件模板
│   │   ├── email-text.js    # 文本邮件模板
│   │   └── email-msg.js     # 消息模板
│   │
│   └── index.js              # Worker 入口
│
├── wrangler.toml             # 生产配置
├── wrangler-dev.toml         # 开发配置
├── wrangler-test.toml        # 测试配置
├── vitest.config.js          # 测试配置
└── package.json
```

### 前端 (mail-vue)

```
mail-vue/
├── src/
│   ├── views/                  # 页面组件
│   │   ├── email/            # 收件箱
│   │   ├── content/          # 邮件详情
│   │   ├── send/             # 发送邮件
│   │   ├── draft/            # 草稿箱
│   │   ├── archive/          # 归档邮件
│   │   ├── star/             # 星标邮件
│   │   ├── all-email/        # 全量邮件（管理员）
│   │   ├── user/             # 用户管理
│   │   ├── role/             # 角色权限
│   │   ├── reg-key/          # 注册码
│   │   ├── setting/          # 个人设置
│   │   ├── sys-setting/      # 系统设置
│   │   ├── contact/          # 联系人
│   │   ├── filter/           # 过滤规则
│   │   ├── forward-rule/     # 转发规则
│   │   ├── audit/            # 审计日志
│   │   ├── analysis/         # 数据分析
│   │   ├── login/            # 登录页
│   │   ├── test/             # 测试页
│   │   └── 404/              # 404 页面
│   │
│   ├── components/            # 公共组件
│   │   ├── email-scroll/    # 邮件列表滚动
│   │   ├── hamburger/       # 汉堡菜单
│   │   ├── loading/         # 加载动画
│   │   ├── send-percent/    # 发送进度
│   │   ├── shadow-html/     # HTML 渲染
│   │   └── tiny-editor/     # 富文本编辑器
│   │
│   ├── request/              # API 请求
│   │   ├── login.js         # 登录接口
│   │   ├── email.js         # 邮件接口
│   │   ├── account.js       # 账号接口
│   │   ├── user.js          # 用户接口
│   │   ├── role.js          # 角色接口
│   │   ├── setting.js       # 设置接口
│   │   ├── contact.js       # 联系人接口
│   │   ├── filter.js        # 过滤接口
│   │   ├── forward-rule.js  # 转发接口
│   │   ├── star.js          # 星标接口
│   │   ├── audit.js         # 审计接口
│   │   ├── analysis.js      # 分析接口
│   │   ├── reg-key.js       # 注册码接口
│   │   ├── all-email.js     # 全量邮件接口
│   │   ├── 2fa.js           # 2FA 接口
│   │   ├── oauth.js         # OAuth 接口
│   │   ├── my.js            # 当前用户接口
│   │   └── tg-channel.js   # TG 频道接口
│   │
│   ├── store/                # 状态管理
│   │   ├── user.js          # 用户状态
│   │   ├── setting.js       # 设置状态
│   │   ├── account.js       # 账号状态
│   │   ├── email.js         # 邮件状态
│   │   ├── send.js          # 发送状态
│   │   ├── draft.js         # 草稿状态
│   │   ├── contact.js       # 联系人状态
│   │   ├── role.js          # 角色状态
│   │   ├── ui.js            # UI 状态
│   │   └── writer.js        # 编辑器状态
│   │
│   ├── router/               # 路由配置
│   │   └── index.js        # 路由定义
│   │
│   ├── axios/                # Axios 配置
│   │   └── index.js        # 请求/响应拦截
│   │
│   ├── layout/               # 布局组件
│   │   └── index.vue       # 主布局
│   │
│   ├── init/                 # 初始化
│   │   └── init.js         # 应用初始化
│   │
│   ├── perm/                 # 权限控制
│   │   └── perm.js        # 权限指令
│   │
│   ├── i18n/                 # 国际化
│   │   ├── index.js       # 配置
│   │   ├── zh.js         # 中文
│   │   └── en.js         # 英文
│   │
│   ├── echarts/             # 图表
│   │   └── index.js      # ECharts 配置
│   │
│   ├── icons/               # 图标
│   ├── db/                  # 本地数据库
│   ├── enums/              # 枚举
│   ├── utils/              # 工具类
│   ├── app.vue             # 根组件
│   ├── main.js             # 入口文件
│   └── style.css           # 全局样式
│
├── .env.dev                 # 开发环境
├── .env.release             # 生产环境
├── .env.remote              # 远程开发
├── vite.config.js           # Vite 配置
└── package.json
```

## 核心业务流程

### 邮件发送流程

```
用户填写表单
      │
      ▼
前端 POST /api/email/send
      │
      ▼
权限检查（角色发送次数限制、域名权限）
      │
      ▼
判断接收方类型
      │
      ├── 全为站内邮箱
      │      │
      │      ▼
      │   直接保存到数据库 (HandleOnSiteEmail)
      │
      └── 包含站外邮箱
             │
             ▼
      判断发送方式（Resend / SES / 本地 SES API）
             │
             ▼
      调用外部邮件服务发送
             │
             ▼
保存附件到 R2（如有）
      │
      ▼
更新用户发送计数
      │
      ▼
记录每日发送统计到 KV
```

### 邮件接收流程

```
Cloudflare Workers 接收邮件 (email() 函数)
           │
           ▼
使用 PostalMime 解析原始邮件
           │
           ▼
查找收件人账号（account）
           │
           ▼
检查 Catch-all 规则匹配
           │
           ▼
权限验证（域名使用权限、黑名单）
           │
           ▼
保存邮件到 D1（状态 SAVING）
           │
           ▼
保存附件到 R2（如有）
           │
           ▼
更新邮件状态为 RECEIVE 或 NOONE
           │
           ▼
发送 Telegram 通知（如配置）
           │
           ▼
执行转发规则
```

### 定时任务（每日执行）

| 任务 | 函数 | 说明 |
|------|------|------|
| 清理过期验证码 | verifyRecordService.clearRecord | 清理旧的验证码记录 |
| 重置每日发送计数 | userService.resetDaySendCount | 重置用户每日发送次数 |
| 完成未接收邮件 | emailService.completeReceiveAll | 完成接收状态异常的邮件 |
| 清理未绑定 OAuth | oauthService.clearNoBindOathUser | 清理长期未绑定账号的 OAuth 用户 |
| 清理临时文件 | settingService.cleanupTempFiles | 清理过期临时文件 |
| 清理过期规则 | settingService.cleanupRules | 清理已过期的过滤/转发规则 |
| 清理 TG 归档缓存 | tgArchiveService.cleanupExpiredCache | 清理过期的 TG 文件归档记录 |

## 安全机制

### JWT 认证
- Token 存储在 Header 中
- 支持同一用户最多 10 个并发 Token
- Token 有效期 30 天
- 每日刷新过期时间

### 权限控制
- 基于 RBAC 模型的权限控制
- 权限细粒度到 API 级别
- 管理员拥有所有权限

### 其他安全措施
- 密码 PBKDF2 盐值哈希
- Turnstile 人机验证
- 操作审计日志
- 域名使用权限限制

## 部署方式

| 方式 | 说明 |
|------|------|
| GitHub Actions | 自动部署到 Cloudflare Workers |
| 手动部署 | 使用 Wrangler CLI 部署 |
| 本地开发 | 使用 Wrangler Dev Server |

详细部署请参考 [部署指南](deployment-guide.md)。
