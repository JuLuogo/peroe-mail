# Peroe Mail 文档中心

欢迎使用 Peroe Mail 项目文档！本文档提供项目的完整技术参考。

## 文档索引

### 入门指南

| 文档 | 说明 |
|------|------|
| [项目概述](project-overview.md) | 项目简介、功能特性、技术架构 |
| [开发指南](development-guide.md) | 本地开发环境搭建、调试、代码规范 |
| [部署指南](deployment-guide.md) | 生产环境部署到 Cloudflare Workers |

### 技术参考

| 文档 | 说明 |
|------|------|
| [API 参考](api-reference.md) | 完整的 API 接口文档 |
| [数据库结构](database-schema.md) | 数据库表结构详解 |
| [权限系统](permission-system.md) | RBAC 权限控制详解 |
| [系统架构](architecture.md) | 系统架构设计详解 |
| [环境变量](env-variables.md) | 所有环境变量配置说明 |

### 开发指南

| 文档 | 说明 |
|------|------|
| [开发指南](development-guide.md) | 本地开发、调试、代码规范 |
| [项目概述](project-overview.md) | 项目结构和模块详解 |

### 部署参考

| 文档 | 说明 |
|------|------|
| [GitHub Actions 部署](github-action.md) | CI/CD 自动部署配置（见 env-variables.md） |
| [环境变量配置](env-variables.md) | 所有环境变量配置说明 |

## 在线资源

- **在线演示**: [https://skymail.ink](https://skymail.ink)
- **部署文档**: [https://doc.skymail.ink](https://doc.skymail.ink)
- **交流群组**: [Telegram](https://t.me/cloud_mail_tg)

## 项目结构

```
cloud-mail/
├── mail-worker/          # 后端 Worker 项目
│   ├── src/
│   │   ├── api/         # API 路由层
│   │   ├── service/     # 业务服务层
│   │   ├── dao/         # 数据访问层
│   │   ├── entity/      # 数据库实体
│   │   └── ...
│   └── wrangler.toml    # 配置文件
│
├── mail-vue/             # 前端 Vue 项目
│   ├── src/
│   │   ├── views/       # 页面组件
│   │   ├── request/     # API 请求
│   │   ├── store/       # 状态管理
│   │   └── ...
│   └── package.json
│
├── local-ses-api/        # 本地 SES API（可选）
└── doc/                  # 项目文档
```

## 技术栈

| 分类 | 技术 | 用途 |
|------|------|------|
| 后端运行时 | Cloudflare Workers | Serverless 运行环境 |
| 后端框架 | Hono 4.7 | Web 框架 |
| ORM | Drizzle 0.42 | 数据库操作 |
| 前端框架 | Vue 3.5 | UI 框架 |
| UI 组件 | Element Plus 2.13 | UI 组件库 |
| 状态管理 | Pinia 3.0 | 状态管理 |
| 数据库 | Cloudflare D1 | SQLite 数据库 |
| 缓存 | Cloudflare KV | Key-Value 存储 |
| 对象存储 | Cloudflare R2 | 文件存储 |
| 邮件发送 | Resend / SES | 邮件发送服务 |

## 功能模块

### 用户与权限
- 用户注册、登录、登出
- RBAC 角色权限控制
- 注册码邀请机制
- 两步验证 (TOTP)
- OAuth 登录 (LinuxDo)

### 邮件功能
- 邮件发送与接收
- 附件收发 (R2 存储)
- 邮件搜索与过滤
- 邮件星标与归档
- Catch-all 转发规则

### 管理功能
- 用户管理
- 角色管理
- 系统设置
- 审计日志
- 数据分析 (ECharts)

### 集成功能
- Telegram 机器人推送
- Cloudflare Turnstile 验证
- Webhook 支持

## 许可证

本项目采用 [MIT](../LICENSE) 许可证。
