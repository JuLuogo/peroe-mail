# 数据库结构

本文档详细介绍 Peroe Mail 项目的数据库表结构。

## 数据库概述

- **数据库类型**: SQLite (Cloudflare D1)
- **ORM**: Drizzle ORM
- **表数量**: 19 个

## ER 关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    user     │──────<│   account   │       │    role     │
│  用户表      │  1:N  │  账号表      │       │   角色表    │
└─────────────┘       └─────────────┘       └──────┬──────┘
      │                                            │
      │ 1:N                                       │ 1:N
      ▼                                            ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    email    │──────>│ attachments │       │  role_perm  │
│   邮件表     │  1:N  │   附件表    │       │ 角色权限关联│
└─────────────┘       └─────────────┘       └─────────────┘
      │
      │ 1:N
      ▼
┌─────────────┐
│    star     │
│  星标邮件表  │
└─────────────┘

┌─────────────┐       ┌─────────────┐
│   setting   │       │   audit_log │
│  系统设置表  │       │  审计日志表  │
└─────────────┘       └─────────────┘
```

---

## 用户相关表

### user - 用户表

存储用户账户信息。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| userId | INTEGER | 是 | 自增 | 用户 ID（主键） |
| email | TEXT | 是 | - | 邮箱地址（唯一） |
| type | INTEGER | 是 | 1 | 用户类型（1=普通用户） |
| password | TEXT | 是 | - | 密码（PBKDF2 哈希） |
| salt | TEXT | 是 | - | 密码盐值 |
| status | INTEGER | 是 | 0 | 状态（0=正常，1=禁用） |
| createTime | TEXT | 是 | CURRENT_TIMESTAMP | 创建时间 |
| activeTime | TEXT | - | - | 最后活跃时间 |
| createIp | TEXT | - | - | 注册 IP |
| activeIp | TEXT | - | - | 最后活跃 IP |
| os | TEXT | - | - | 操作系统 |
| browser | TEXT | - | - | 浏览器 |
| device | TEXT | - | - | 设备 |
| sort | INTEGER | - | 0 | 排序 |
| sendCount | INTEGER | - | 0 | 今日发送计数 |
| regKeyId | INTEGER | 是 | 0 | 注册码 ID |
| isDel | INTEGER | 是 | 0 | 删除状态（0=未删除，1=已删除） |
| forwardStatus | INTEGER | 是 | 0 | 转发状态（0=关闭，1=开启） |
| forwardEmail | TEXT | 是 | '' | 转发目标邮箱 |
| totpSecret | TEXT | - | - | TOTP 密钥（加密存储） |
| totpEnabled | INTEGER | 是 | 0 | TOTP 是否启用（0=否，1=是） |
| totpBindTime | TEXT | - | - | TOTP 绑定时间 |
| availDomain | TEXT | 是 | '' | 可用域名列表（JSON 数组） |

---

### account - 邮箱账号表

用户的多邮箱账号。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| accountId | INTEGER | 是 | 自增 | 账号 ID（主键） |
| email | TEXT | 是 | - | 邮箱地址 |
| name | TEXT | 是 | '' | 账号显示名称 |
| status | INTEGER | 是 | 0 | 状态（0=正常） |
| latestEmailTime | TEXT | - | - | 最后收到邮件时间 |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 创建时间 |
| userId | INTEGER | 是 | - | 所属用户 ID（外键） |
| allReceive | INTEGER | 是 | 0 | 是否接收所有邮件（0=否，1=是） |
| sort | INTEGER | 是 | 0 | 排序（数字越小越靠前） |
| isDel | INTEGER | 是 | 0 | 删除状态（0=未删除，1=已删除） |

---

### role - 角色表

用户角色定义。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| roleId | INTEGER | 是 | 自增 | 角色 ID（主键） |
| name | TEXT | 是 | - | 角色名称 |
| key | TEXT | 是 | - | 角色标识（唯一） |
| description | TEXT | - | - | 角色描述 |
| banEmail | TEXT | 是 | '' | 禁用邮箱域名字符串 |
| banEmailType | INTEGER | 是 | 0 | 禁用类型（0=禁用列表，1=仅允许列表） |
| availDomain | TEXT | - | '' | 可用域名列表 |
| sort | INTEGER | - | - | 排序 |
| isDefault | INTEGER | - | 0 | 是否为默认注册角色 |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 创建时间 |
| userId | INTEGER | - | - | 创建者用户 ID |
| sendCount | INTEGER | - | - | 每日发送限制 |
| sendType | TEXT | - | 'count' | 发送计数类型 |
| accountCount | INTEGER | - | - | 账号数量限制 |

---

### perm - 权限表

权限定义树。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| permId | INTEGER | 是 | 自增 | 权限 ID（主键） |
| name | TEXT | 是 | - | 权限名称 |
| permKey | TEXT | - | - | 权限标识（如 `email:send`） |
| pid | INTEGER | 是 | 0 | 父权限 ID（0=顶级） |
| type | INTEGER | 是 | 2 | 类型（1=页面，2=按钮/操作） |
| sort | INTEGER | - | - | 排序 |

---

### role_perm - 角色权限关联表

角色与权限的多对多关系。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | ID（主键） |
| roleId | INTEGER | - | - | 角色 ID（外键） |
| permId | INTEGER | - | - | 权限 ID（外键） |

---

## 邮件相关表

### email - 邮件表

存储所有邮件。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| emailId | INTEGER | 是 | 自增 | 邮件 ID（主键） |
| sendEmail | TEXT | - | - | 发件人邮箱 |
| name | TEXT | - | - | 发件人名称 |
| accountId | INTEGER | 是 | - | 关联账号 ID（外键） |
| userId | INTEGER | 是 | - | 所属用户 ID（外键） |
| subject | TEXT | - | - | 邮件主题 |
| text | TEXT | - | - | 纯文本内容 |
| content | TEXT | - | - | HTML 内容 |
| cc | TEXT | - | '[]' | 抄送列表（JSON 数组） |
| bcc | TEXT | - | '[]' | 密送列表（JSON 数组） |
| recipient | TEXT | - | - | 收件人 |
| toEmail | TEXT | 是 | '' | 收件人邮箱 |
| toName | TEXT | 是 | '' | 收件人名称 |
| inReplyTo | TEXT | - | '' | 回复的 Message-ID |
| relation | TEXT | - | '' | 关联（用于邮件会话） |
| messageId | TEXT | - | '' | 邮件唯一标识 |
| type | INTEGER | 是 | 0 | 类型（0=接收，1=发送） |
| status | INTEGER | 是 | 0 | 状态（见下方状态说明） |
| resendEmailId | TEXT | - | - | Resend 邮件 ID |
| message | TEXT | - | - | 状态消息或错误信息 |
| unread | INTEGER | 是 | 0 | 已读状态（0=已读，1=未读） |
| createTime | TEXT | 是 | CURRENT_TIMESTAMP | 创建时间 |
| isDel | INTEGER | 是 | 0 | 删除状态（0=未删除，1=已删除） |
| isArchive | INTEGER | 是 | 0 | 归档状态（0=未归档，1=已归档） |
| archiveTime | TEXT | - | - | 归档时间 |

**邮件状态 (status) 说明**:

| 值 | 状态名 | 说明 |
|----|--------|------|
| 0 | SAVING | 保存中（中间状态） |
| 1 | RECEIVE | 已接收 |
| 2 | SENT | 已发送 |
| 3 | DELIVERED | 已送达 |
| 4 | BOUNCED | 投递失败 |
| 5 | NOONE | 无收件人（邮件被过滤） |

**邮件类型 (type) 说明**:

| 值 | 类型名 | 说明 |
|----|--------|------|
| 0 | RECEIVE | 接收的邮件 |
| 1 | SEND | 发送的邮件 |

---

### attachments - 附件表

存储邮件附件元数据。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| attId | INTEGER | 是 | 自增 | 附件 ID（主键） |
| userId | INTEGER | 是 | - | 所属用户 ID |
| emailId | INTEGER | - | - | 关联邮件 ID |
| accountId | INTEGER | - | - | 关联账号 ID |
| key | TEXT | 是 | - | R2 存储 Key |
| filename | TEXT | 是 | - | 文件名 |
| mimeType | TEXT | - | - | MIME 类型 |
| size | INTEGER | - | - | 文件大小（字节） |
| type | INTEGER | - | 0 | 类型（0=普通附件） |
| disposition | TEXT | - | - | Content-Disposition |
| contentId | TEXT | - | - | 内联附件的 Content-ID |

---

### star - 星标邮件表

用户标记的星标邮件。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| starId | INTEGER | 是 | 自增 | ID（主键） |
| userId | INTEGER | 是 | - | 用户 ID（外键） |
| emailId | INTEGER | 是 | - | 邮件 ID（外键） |
| createTime | TEXT | 是 | CURRENT_TIMESTAMP | 创建时间 |

---

## 注册与认证表

### reg_key - 注册码表

邀请码/注册码管理。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| regKeyId | INTEGER | 是 | 自增 | 注册码 ID（主键） |
| code | TEXT | 是 | '' | 注册码（唯一） |
| count | INTEGER | 是 | 0 | 已使用次数 |
| roleId | INTEGER | 是 | 0 | 注册后分配的角色 ID |
| userId | INTEGER | 是 | 0 | 创建者用户 ID |
| expireTime | TEXT | - | - | 过期时间 |
| createTime | TEXT | 是 | CURRENT_TIMESTAMP | 创建时间 |

---

### verify_record - 验证码记录表

用于 Turnstile 人机验证频率限制。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| vrId | INTEGER | 是 | 自增 | ID（主键） |
| ip | TEXT | 是 | '' | IP 地址 |
| count | INTEGER | 是 | 1 | 验证次数 |
| type | INTEGER | 是 | 0 | 验证类型（0=注册，1=登录） |
| updateTime | TEXT | 是 | CURRENT_TIMESTAMP | 更新时间 |

---

### oauth - OAuth 用户表

第三方 OAuth 登录用户。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| oauthId | INTEGER | 是 | 自增 | ID（主键） |
| oauthUserId | TEXT | 是 | - | OAuth 提供商的用户 ID |
| username | TEXT | - | - | 用户名 |
| name | TEXT | - | - | 显示名称 |
| avatar | TEXT | - | - | 头像 URL |
| userId | INTEGER | - | - | 绑定的本地用户 ID（NULL=未绑定） |

---

## 业务规则表

### filter_rule - 过滤规则表

邮件自动过滤规则。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ruleId | INTEGER | 是 | 自增 | 规则 ID（主键） |
| userId | INTEGER | 是 | - | 所属用户 ID |
| name | TEXT | 是 | - | 规则名称 |
| field | TEXT | 是 | - | 匹配字段（from/to/subject/content） |
| operator | TEXT | 是 | - | 操作符（contains/equals/startsWith/endsWith） |
| value | TEXT | 是 | - | 匹配值 |
| action | TEXT | 是 | - | 执行动作（star/archive/forward/delete） |
| actionTarget | TEXT | - | - | 动作目标（如转发地址） |
| status | INTEGER | - | 1 | 状态（0=禁用，1=启用） |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 创建时间 |

---

### forward_rule - 转发规则表

Catch-all 域名转发规则。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| ruleId | INTEGER | 是 | 自增 | 规则 ID（主键） |
| userId | INTEGER | 是 | - | 所属用户 ID |
| pattern | TEXT | 是 | - | 匹配模式（如 `*@example.com`） |
| forwardTo | TEXT | 是 | - | 转发目标邮箱 |
| priority | INTEGER | - | 0 | 优先级（数字越小优先级越高） |
| status | INTEGER | - | 1 | 状态（0=禁用，1=启用） |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 创建时间 |

---

### contact - 联系人表

用户通讯录。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| contactId | INTEGER | 是 | 自增 | 联系人 ID（主键） |
| userId | INTEGER | 是 | - | 所属用户 ID |
| email | TEXT | 是 | - | 联系人邮箱 |
| name | TEXT | - | - | 联系人名称 |
| groupId | INTEGER | - | - | 所属群组 ID |
| star | INTEGER | - | 0 | 星标状态 |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 创建时间 |

---

### contact_group - 联系人群组表

联系人分组。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| groupId | INTEGER | 是 | 自增 | 群组 ID（主键） |
| userId | INTEGER | 是 | - | 所属用户 ID |
| name | TEXT | 是 | - | 群组名称 |
| color | TEXT | - | - | 颜色代码 |

---

## 日志与审计表

### audit_log - 审计日志表

用户操作审计日志。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| logId | INTEGER | 是 | 自增 | 日志 ID（主键） |
| userId | INTEGER | - | - | 操作用户 ID |
| userEmail | TEXT | - | - | 操作用户邮箱 |
| action | TEXT | - | - | 操作类型 |
| targetType | TEXT | - | - | 目标类型（如 `user`, `email`） |
| targetId | TEXT | - | - | 目标 ID |
| detail | TEXT | - | - | 详细信息（JSON） |
| ip | TEXT | - | - | 操作 IP |
| createTime | TEXT | - | CURRENT_TIMESTAMP | 操作时间 |

---

## 系统配置表

### setting - 系统设置表

存储系统配置项（60+ 字段）。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | ID（主键） |
| title | TEXT | - | 'Peroe Mail' | 网站标题 |
| background | TEXT | - | - | 登录背景图片 |
| loginOpacity | REAL | - | 0.85 | 登录框透明度 |
| register | INTEGER | - | 0 | 是否允许注册（0=允许，1=禁止） |
| regKey | INTEGER | - | 0 | 是否启用注册码（0=否，1=是） |
| send | INTEGER | - | 0 | 是否允许发送（0=允许，1=禁止） |
| receive | INTEGER | - | 0 | 是否允许接收（0=允许，1=禁止） |
| resendTokens | TEXT | - | - | Resend API Token 配置（JSON） |
| sesAccessKey | TEXT | - | - | AWS SES Access Key |
| sesSecretKey | TEXT | - | - | AWS SES Secret Key |
| sesRegion | TEXT | - | - | AWS SES 区域 |
| sesEnabled | INTEGER | - | 0 | 是否启用 SES |
| tgBotToken | TEXT | - | - | Telegram Bot Token |
| tgChatId | TEXT | - | - | Telegram Chat ID |
| tgBotStatus | INTEGER | - | 1 | TG 推送状态（0=启用，1=禁用） |
| forwardEmail | TEXT | - | - | 全局转发邮箱 |
| forwardStatus | INTEGER | - | 0 | 全局转发状态 |
| siteKey | TEXT | - | - | Turnstile Site Key |
| secretKey | TEXT | - | - | Turnstile Secret Key |
| r2Domain | TEXT | - | - | R2 自定义域名 |
| linuxdoSwitch | INTEGER | - | - | LinuxDo OAuth 开关 |
| ... | ... | ... | ... | 更多配置字段 |

---

## Telegram 相关表

### tg_channel - Telegram 频道表

Telegram 推送频道配置。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | ID（主键） |
| chatId | TEXT | 是 | - | Telegram Chat ID |
| name | TEXT | - | - | 频道名称 |
| type | TEXT | - | - | 类型（channel/group/private） |
| mediaFilter | TEXT | - | - | 媒体过滤器（photo,video,document） |
| maxSize | INTEGER | - | - | 最大文件大小 |
| archiveEnabled | INTEGER | - | 1 | 是否启用归档（0=否，1=是） |
| archiveDays | INTEGER | - | 30 | 归档保留天数 |
| enabled | INTEGER | - | 1 | 启用状态（0=禁用，1=启用） |
| priority | INTEGER | - | 0 | 优先级 |
| threadId | TEXT | - | - | 话题 ID（用于论坛模式） |

---

### tg_archive - Telegram 归档表

Telegram 文件归档记录。

| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| id | INTEGER | 是 | 自增 | ID（主键） |
| attId | INTEGER | - | - | 附件 ID |
| channelId | INTEGER | - | - | 频道 ID |
| tgFileId | TEXT | - | - | Telegram File ID |
| tgMessageId | TEXT | - | - | Telegram Message ID |
| tgFileUniqueId | TEXT | - | - | Telegram File Unique ID |

---

## 数据库索引

系统会自动创建以下索引：

| 表名 | 索引名 | 字段 | 类型 |
|------|--------|------|------|
| user | idx_user_email | email | UNIQUE |
| account | idx_account_userId | userId | NORMAL |
| email | idx_email_accountId | accountId | NORMAL |
| email | idx_email_userId | userId | NORMAL |
| email | idx_email_createTime | createTime | DESC |
| star | idx_star_userId | userId | NORMAL |
| star | idx_star_emailId | emailId | NORMAL |
| contact | idx_contact_userId | userId | NORMAL |
| filter_rule | idx_filter_userId | userId | NORMAL |
| forward_rule | idx_forward_userId | userId | NORMAL |

---

## 数据迁移

数据库支持版本化迁移，从 v1.0 到 v2.22。每次迁移只添加新字段/表，已有的跳过。

迁移文件位于 `mail-worker/src/init/init.js`。
