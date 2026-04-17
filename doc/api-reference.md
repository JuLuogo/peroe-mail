# API 参考

本文档提供 Peroe Mail 所有 API 接口的完整参考。

## 基础信息

### Base URL

```
生产环境: https://your-domain.com/api
开发环境: http://localhost:8787/api
```

### 认证方式

API 使用 JWT Token 认证，Token 通过响应头返回：

```
Authorization: <token>
```

### 响应格式

所有接口返回统一的 JSON 格式：

```json
{
  "success": true,
  "code": 0,
  "data": { ... },
  "message": "操作成功"
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 认证接口

### POST /login - 用户登录

用户登录系统。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |

**请求示例**

```json
{
  "email": "user@example.com",
  "password": "your-password"
}
```

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "操作成功"
}
```

---

### POST /register - 用户注册

注册新用户。

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |
| code | string | 否 | 注册码（如果启用注册码功能） |
| turnstileToken | string | 否 | Turnstile 验证 Token |

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "注册成功"
}
```

---

### DELETE /logout - 用户登出

登出当前用户。

**请求头**

```
Authorization: <token>
```

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "message": "操作成功"
}
```

---

## 邮件接口

### GET /email/list - 邮件列表

获取用户的邮件列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 账号 ID |
| page | number | 否 | 页码（默认 1） |
| pageSize | number | 否 | 每页数量（默认 20） |

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "list": [
      {
        "emailId": 1,
        "sendEmail": "sender@example.com",
        "name": "Sender Name",
        "subject": "邮件主题",
        "text": "纯文本内容",
        "content": "HTML 内容",
        "toEmail": "user@example.com",
        "type": 0,
        "status": 1,
        "unread": 1,
        "createTime": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### GET /email/latest - 最新邮件

获取最新邮件。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 账号 ID |
| limit | number | 否 | 返回数量（默认 10） |

---

### GET /email/search - 搜索邮件

搜索邮件。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 账号 ID |
| keyword | string | 否 | 关键词 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |
| from | string | 否 | 发件人 |
| to | string | 否 | 收件人 |
| hasAtt | boolean | 否 | 是否有附件 |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

---

### POST /email/send - 发送邮件

发送新邮件。

**请求头**

```
Authorization: <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 发件账号 ID |
| toEmail | string | 是 | 收件人邮箱（多个用逗号分隔） |
| toName | string | 否 | 收件人名称 |
| subject | string | 是 | 邮件主题 |
| content | string | 是 | 邮件内容（HTML） |
| text | string | 否 | 纯文本内容 |
| cc | string | 否 | 抄送（多个用逗号分隔） |
| bcc | string | 否 | 密送（多个用逗号分隔） |
| atts | array | 否 | 附件列表 `[{key, filename}]` |
| inReplyTo | string | 否 | 回复的 Message-ID |

**请求示例**

```json
{
  "accountId": 1,
  "toEmail": "receiver@example.com",
  "subject": "测试邮件",
  "content": "<h1>Hello</h1><p>这是一封测试邮件</p>",
  "text": "Hello, 这是一封测试邮件",
  "cc": "cc1@example.com,cc2@example.com",
  "atts": [
    {"key": "attachment-key", "filename": "document.pdf"}
  ]
}
```

---

### PUT /email/read - 标记已读

标记邮件为已读。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailId": 1
}
```

---

### PUT /email/archive - 归档邮件

将邮件归档。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailId": 1
}
```

---

### PUT /email/unarchive - 取消归档

取消邮件归档。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailId": 1
}
```

---

### DELETE /email/delete - 删除邮件

删除邮件。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| emailId | number | 是 | 邮件 ID |

---

### GET /email/archiveList - 归档列表

获取归档邮件列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 账号 ID |
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

---

### GET /email/attList - 附件列表

获取邮件的附件列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| emailId | number | 是 | 邮件 ID |

---

## 账号接口

### GET /account/list - 账号列表

获取用户的邮箱账号列表。

**请求头**

```
Authorization: <token>
```

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": [
    {
      "accountId": 1,
      "email": "user@example.com",
      "name": "我的邮箱",
      "status": 0,
      "allReceive": true,
      "sort": 0
    }
  ]
}
```

---

### POST /account/add - 添加账号

添加新的邮箱账号。

**请求头**

```
Authorization: <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| name | string | 否 | 账号名称 |

---

### DELETE /account/delete - 删除账号

删除邮箱账号。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| accountId | number | 是 | 账号 ID |

---

### PUT /account/setName - 设置名称

设置账号显示名称。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "accountId": 1,
  "name": "新名称"
}
```

---

### PUT /account/setAllReceive - 设置全接收

设置账号是否接收所有邮件。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "accountId": 1,
  "allReceive": true
}
```

---

### PUT /account/setAsTop - 设置置顶

设置账号排序位置。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "accountId": 1,
  "sort": 0
}
```

---

## 用户接口

### GET /user/list - 用户列表

获取用户列表（管理员）。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| email | string | 否 | 邮箱搜索 |
| status | number | 否 | 状态筛选 |

---

### POST /user/add - 添加用户

添加新用户（管理员）。

**请求头**

```
Authorization: <token>
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 邮箱地址 |
| password | string | 是 | 密码 |
| roleId | number | 否 | 角色 ID |

---

### DELETE /user/delete - 删除用户

删除用户（管理员）。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | number | 是 | 用户 ID |

---

### PUT /user/setPwd - 修改密码

修改用户密码。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "userId": 1,
  "password": "new-password"
}
```

---

### PUT /user/setStatus - 设置状态

设置用户状态（启用/禁用）。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "userId": 1,
  "status": 0
}
```

---

### PUT /user/setType - 设置类型

设置用户类型。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "userId": 1,
  "type": 0
}
```

---

### PUT /user/restore - 恢复用户

恢复已删除的用户。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "userId": 1
}
```

---

### PUT /user/setAvailDomain - 设置可用域名

设置用户可使用的邮箱域名。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "userId": 1,
  "availDomain": ["example.com", "test.com"]
}
```

---

### GET /user/allAccount - 所有账号

获取所有用户的账号（管理员）。

**请求头**

```
Authorization: <token>
```

---

## 角色接口

### GET /role/list - 角色列表

获取角色列表。

**请求头**

```
Authorization: <token>
```

---

### GET /role/tree - 权限树

获取权限树结构。

**请求头**

```
Authorization: <token>
```

---

### POST /role/add - 添加角色

添加新角色。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "name": "普通用户",
  "key": "user",
  "banEmail": false,
  "availDomain": ["example.com"],
  "sendCount": 100,
  "sendType": 0,
  "accountCount": 5
}
```

---

### PUT /role/set - 设置角色

设置角色权限和配置。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "roleId": 1,
  "name": "新名称",
  "banEmail": false,
  "availDomain": ["example.com"],
  "sendCount": 200,
  "sendType": 0,
  "accountCount": 10,
  "permIds": [1, 2, 3]
}
```

---

### PUT /role/setDefault - 设置默认角色

设置默认注册角色。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "roleId": 1
}
```

---

### DELETE /role/delete - 删除角色

删除角色。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roleId | number | 是 | 角色 ID |

---

## 注册码接口

### GET /regKey/list - 注册码列表

获取注册码列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

---

### POST /regKey/add - 生成注册码

生成新的注册码。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "count": 10,
  "roleId": 1,
  "expireTime": "2024-12-31T23:59:59Z"
}
```

---

### DELETE /regKey/delete - 删除注册码

删除注册码。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| regKeyId | number | 是 | 注册码 ID |

---

### POST /regKey/clearNotUse - 清理未使用

清理长期未使用的注册码。

**请求头**

```
Authorization: <token>
```

---

### GET /regKey/history - 使用历史

获取注册码使用历史。

**请求头**

```
Authorization: <token>
```

---

## 设置接口

### GET /setting/query - 获取设置

获取系统设置。

**请求头**

```
Authorization: <token>
```

---

### PUT /setting/set - 设置配置

设置系统配置。

**请求头**

```
Authorization: <token>
```

**请求参数**

系统设置包含 60+ 个配置项，部分常用配置：

| 参数 | 类型 | 说明 |
|------|------|------|
| title | string | 网站标题 |
| background | string | 登录背景 |
| loginOpacity | number | 登录框透明度 |
| register | number | 是否允许注册 (0/1) |
| regKey | number | 是否启用注册码 (0/1) |
| send | number | 是否允许发送邮件 (0/1) |
| receive | number | 是否允许接收邮件 (0/1) |
| resendTokens | object | Resend API Token 配置 |
| sesAccessKey | string | AWS SES Access Key |
| sesSecretKey | string | AWS SES Secret Key |
| sesRegion | string | AWS SES 区域 |
| tgBotToken | string | Telegram Bot Token |
| tgChatId | string | Telegram Chat ID |
| forwardEmail | string | 转发邮箱 |
| forwardStatus | number | 转发状态 |
| siteKey | string | Turnstile Site Key |
| secretKey | string | Turnstile Secret Key |

---

### PUT /setting/setBackground - 设置背景图

上传登录背景图片。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "background": "base64编码的图片数据"
}
```

---

### DELETE /setting/deleteBackground - 删除背景图

删除登录背景图片。

**请求头**

```
Authorization: <token>
```

---

### GET /setting/websiteConfig - 网站公开配置

获取网站公开配置（无需认证）。

---

## 星标接口

### GET /star/list - 星标列表

获取星标邮件列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |

---

### POST /star/add - 添加星标

添加邮件到星标。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailId": 1
}
```

---

### POST /star/cancel - 取消星标

取消邮件星标。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailId": 1
}
```

---

## 联系人接口

### GET /contact/list - 联系人列表

获取联系人列表。

**请求头**

```
Authorization: <token>
```

---

### POST /contact/add - 添加联系人

添加新联系人。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "email": "contact@example.com",
  "name": "联系人名称",
  "groupId": 1
}
```

---

### PUT /contact/update - 更新联系人

更新联系人信息。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "contactId": 1,
  "email": "new@example.com",
  "name": "新名称",
  "groupId": 1
}
```

---

### DELETE /contact/delete - 删除联系人

删除联系人。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| contactId | number | 是 | 联系人 ID |

---

### GET /contact/groupList - 群组列表

获取联系人群组列表。

**请求头**

```
Authorization: <token>
```

---

### POST /contact/groupAdd - 添加群组

添加联系人群组。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "name": "群组名称",
  "color": "#FF0000"
}
```

---

### PUT /contact/groupUpdate - 更新群组

更新群组信息。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "groupId": 1,
  "name": "新名称",
  "color": "#00FF00"
}
```

---

### DELETE /contact/groupDelete - 删除群组

删除联系人群组。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| groupId | number | 是 | 群组 ID |

---

## 过滤规则接口

### GET /filter/list - 规则列表

获取邮件过滤规则列表。

**请求头**

```
Authorization: <token>
```

---

### POST /filter/add - 添加规则

添加过滤规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "name": "规则名称",
  "field": "from",
  "operator": "contains",
  "value": "example.com",
  "action": "star",
  "actionTarget": ""
}
```

**field 可选值**: `from`, `to`, `subject`, `content`
**operator 可选值**: `contains`, `equals`, `startsWith`, `endsWith`
**action 可选值**: `star`, `archive`, `forward`, `delete`

---

### PUT /filter/update - 更新规则

更新过滤规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "ruleId": 1,
  "name": "新名称",
  "field": "from",
  "operator": "contains",
  "value": "new-example.com",
  "action": "star"
}
```

---

### PUT /filter/toggle - 切换状态

启用/禁用过滤规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "ruleId": 1,
  "status": true
}
```

---

### DELETE /filter/delete - 删除规则

删除过滤规则。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleId | number | 是 | 规则 ID |

---

## 转发规则接口

### GET /forward-rule/list - 规则列表

获取 Catch-all 转发规则列表。

**请求头**

```
Authorization: <token>
```

---

### POST /forward-rule/add - 添加规则

添加转发规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "pattern": "*@example.com",
  "forwardTo": "forward@example.com",
  "priority": 1,
  "status": true
}
```

---

### PUT /forward-rule/update - 更新规则

更新转发规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "ruleId": 1,
  "pattern": "*@example.com",
  "forwardTo": "new-forward@example.com",
  "priority": 1,
  "status": true
}
```

---

### PUT /forward-rule/toggle - 切换状态

启用/禁用转发规则。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "ruleId": 1,
  "status": true
}
```

---

### DELETE /forward-rule/delete - 删除规则

删除转发规则。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ruleId | number | 是 | 规则 ID |

---

## 审计日志接口

### GET /audit/list - 审计日志列表

获取审计日志列表（管理员）。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| userId | number | 否 | 用户 ID |
| action | string | 否 | 操作类型 |
| startDate | string | 否 | 开始日期 |
| endDate | string | 否 | 结束日期 |

---

### GET /audit/detail - 审计详情

获取审计日志详情。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| logId | number | 是 | 日志 ID |

---

## 数据分析接口

### GET /analysis/echarts - 统计数据

获取系统统计数据（用于 ECharts 可视化）。

**请求头**

```
Authorization: <token>
```

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "userGrowth": [...],
    "emailStats": [...],
    "sendStats": [...]
  }
}
```

---

## 全量邮件接口（管理员）

### GET /allEmail/list - 邮件列表

获取所有用户的邮件列表。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| userId | number | 否 | 用户 ID |
| keyword | string | 否 | 关键词 |

---

### GET /allEmail/latest - 最新邮件

获取最新邮件（跨所有用户）。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| limit | number | 否 | 返回数量 |

---

### DELETE /allEmail/delete - 删除邮件

删除任意用户的邮件。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| emailId | number | 是 | 邮件 ID |

---

### POST /allEmail/batchDelete - 批量删除

批量删除邮件。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "emailIds": [1, 2, 3]
}
```

---

## Telegram 频道接口

### GET /tg/channels/list - 频道列表

获取 Telegram 频道列表。

**请求头**

```
Authorization: <token>
```

---

### POST /tg/channels/add - 添加频道

添加 Telegram 频道配置。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "chatId": "-1001234567890",
  "name": "频道名称",
  "type": "channel",
  "mediaFilter": "photo,video,document",
  "maxSize": 20971520,
  "archiveEnabled": true,
  "archiveDays": 30,
  "priority": 1,
  "threadId": null
}
```

---

### PUT /tg/channels/update - 更新频道

更新频道配置。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "id": 1,
  "chatId": "-1001234567890",
  "name": "新名称",
  "enabled": true
}
```

---

### DELETE /tg/channels/delete - 删除频道

删除频道配置。

**请求头**

```
Authorization: <token>
```

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 频道 ID |

---

### POST /tg/channels/test - 测试频道

测试频道配置是否正确。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "chatId": "-1001234567890"
}
```

---

### GET /tg/archive - 归档列表

获取 Telegram 归档记录。

**请求头**

```
Authorization: <token>
```

---

## 公开 API

### POST /public/genToken - 生成公开 Token

生成公开访问 Token。

**请求参数**

```json
{
  "email": "user@example.com"
}
```

---

### GET /public/list - 公开邮件列表

获取公开邮件列表（使用公开 Token）。

**请求头**

```
Authorization: <public-token>
```

---

## 两步验证接口

### POST /2fa/setup - 设置两步验证

获取两步验证配置信息。

**请求头**

```
Authorization: <token>
```

**响应示例**

```json
{
  "success": true,
  "code": 0,
  "data": {
    "otpauthUrl": "otpauth://totp/CloudMail:user@example.com?secret=...",
    "base32": "JBSWY3DPEHPK3PXP"
  }
}
```

---

### POST /2fa/enable - 启用两步验证

启用两步验证。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "code": "123456"
}
```

---

### POST /2fa/disable - 禁用两步验证

禁用两步验证。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "code": "123456"
}
```

---

### POST /2fa/verify - 验证代码

验证两步验证代码。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "code": "123456"
}
```

---

## OAuth 接口

### GET /oauth/login - OAuth 登录

发起 OAuth 登录。

**Query 参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| provider | string | 是 | 提供商（如 `linuxdo`） |

---

### GET /oauth/callback - OAuth 回调

OAuth 登录回调。

---

### POST /oauth/bind - 绑定账号

绑定 OAuth 账号到现有用户。

**请求头**

```
Authorization: <token>
```

---

## 我的账户接口

### GET /my/info - 账户信息

获取当前用户信息。

**请求头**

```
Authorization: <token>
```

---

### PUT /my/password - 修改密码

修改当前用户密码。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "oldPassword": "旧密码",
  "newPassword": "新密码"
}
```

---

### DELETE /my/delete - 注销账户

注销当前账户。

**请求头**

```
Authorization: <token>
```

---

## 清理接口

### POST /setting/cleanupTempFiles - 清理临时文件

清理过期临时文件。

**请求头**

```
Authorization: <token>
```

**请求参数**

```json
{
  "types": ["attachment", "temp"],
  "days": 7
}
```

---

### GET /setting/tempFileStats - 临时文件统计

获取临时文件统计信息。

**请求头**

```
Authorization: <token>
```

---

### POST /setting/cleanupRules - 清理过期规则

清理过期的过滤和转发规则。

**请求头**

```
Authorization: <token>
```

---

### GET /setting/ruleStats - 规则统计

获取规则统计信息。

**请求头**

```
Authorization: <token>
```

---

## 错误码详情

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| 0 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未授权 |
| 403 | 403 | 无权限 |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |
| 502 | 502 | 服务不可用（KV/D1 未绑定） |
