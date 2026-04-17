# 权限系统

本文档详细介绍 Peroe Mail 项目的权限控制机制。

## 权限模型

Peroe Mail 采用 **RBAC (Role-Based Access Control)** 模型：

```
用户 (User)
    │
    ▼ 分配角色
角色 (Role)
    │
    ▼ 分配权限
权限 (Permission)
    │
    ▼ 关联 API
API 路由 (API Routes)
```

## 权限结构

### 权限 Key 列表

| 权限 Key | 说明 | 关联 API |
|----------|------|----------|
| `email:send` | 发送邮件 | `/email/send` |
| `email:delete` | 删除邮件 | `/email/delete` |
| `email:archive` | 归档/取消归档 | `/email/archive`, `/email/unarchive` |
| `email:archive:query` | 查询归档列表 | `/email/archiveList` |
| `email:query` | 查询邮件 | `/email/list`, `/email/latest`, `/email/search`, `/email/read`, `/email/attList` |
| `account:add` | 添加账号 | `/account/add` |
| `account:query` | 查询账号列表 | `/account/list` |
| `account:delete` | 删除账号 | `/account/delete` |
| `account:setName` | 设置账号名称 | `/account/setName` |
| `account:setAllReceive` | 设置全接收 | `/account/setAllReceive` |
| `account:setAsTop` | 设置置顶 | `/account/setAsTop` |
| `star:add` | 添加星标 | `/star/add` |
| `star:query` | 查询星标 | `/star/list` |
| `star:delete` | 取消星标 | `/star/cancel` |
| `role:add` | 添加角色 | `/role/add` |
| `role:set` | 设置角色 | `/role/set`, `/role/setDefault` |
| `role:query` | 查询角色 | `/role/list`, `/role/tree` |
| `role:delete` | 删除角色 | `/role/delete` |
| `user:query` | 查询用户 | `/user/list`, `/user/allAccount` |
| `user:add` | 添加用户 | `/user/add` |
| `user:reset-send` | 重置发送计数 | `/user/resetSendCount` |
| `user:set-pwd` | 修改密码 | `/user/setPwd` |
| `user:set-status` | 设置状态 | `/user/setStatus` |
| `user:set-type` | 设置类型 | `/user/setType` |
| `user:delete` | 删除用户 | `/user/delete`, `/user/deleteAccount` |
| `user:restore` | 恢复用户 | `/user/restore` |
| `user:set-avail-domain` | 设置可用域名 | `/user/setAvailDomain` |
| `user:set-forward-status` | 设置转发状态 | `/user/setForwardStatus` |
| `all-email:query` | 查询所有邮件 | `/allEmail/list`, `/allEmail/latest` |
| `all-email:delete` | 删除邮件 | `/allEmail/delete`, `/allEmail/batchDelete` |
| `setting:query` | 查询设置 | `/setting/query` |
| `setting:set` | 修改设置 | `/setting/set`, `/setting/setBackground`, `/setting/deleteBackground` |
| `analysis:query` | 数据分析 | `/analysis/echarts` |
| `reg-key:add` | 添加注册码 | `/regKey/add` |
| `reg-key:query` | 查询注册码 | `/regKey/list`, `/regKey/history` |
| `reg-key:delete` | 删除注册码 | `/regKey/delete`, `/regKey/clearNotUse` |
| `contact:query` | 查询联系人 | `/contact/list`, `/contact/groupList` |
| `contact:add` | 添加联系人 | `/contact/add`, `/contact/groupAdd` |
| `contact:update` | 更新联系人 | `/contact/update`, `/contact/toggleStar`, `/contact/groupUpdate` |
| `contact:delete` | 删除联系人 | `/contact/delete`, `/contact/groupDelete` |
| `filter:query` | 查询过滤规则 | `/filter/list` |
| `filter:add` | 添加过滤规则 | `/filter/add` |
| `filter:update` | 更新过滤规则 | `/filter/update`, `/filter/toggle` |
| `filter:delete` | 删除过滤规则 | `/filter/delete` |
| `audit:query` | 查询审计日志 | `/audit/list`, `/audit/detail` |
| `forward-rule:query` | 查询转发规则 | `/forward-rule/list` |
| `forward-rule:add` | 添加转发规则 | `/forward-rule/add` |
| `forward-rule:update` | 更新转发规则 | `/forward-rule/update`, `/forward-rule/toggle` |
| `forward-rule:delete` | 删除转发规则 | `/forward-rule/delete` |
| `temp-file-clean:query` | 查询临时文件统计 | `/setting/tempFileStats` |
| `temp-file-clean:action` | 清理临时文件 | `/setting/cleanupTempFiles` |
| `rule-clean:query` | 查询规则统计 | `/setting/ruleStats` |
| `rule-clean:action` | 清理规则 | `/setting/cleanupRules` |
| `tg-channel:query` | 查询 TG 频道 | `/tg/channels/list`, `/tg/archive` |
| `tg-channel:add` | 添加 TG 频道 | `/tg/channels/add`, `/tg/channels/test` |
| `tg-channel:update` | 更新 TG 频道 | `/tg/channels/update` |
| `tg-channel:delete` | 删除 TG 频道 | `/tg/channels/delete` |
| `my:delete` | 注销账户 | `/my/delete` |

## 默认角色

### 管理员 (Admin)

管理员拥有所有权限，无需显式分配。

**判断条件**: 用户邮箱等于环境变量 `admin` 配置的邮箱。

### 普通用户 (Default)

新注册用户默认分配的角色。

| 权限 Key | 说明 |
|----------|------|
| `email:send` | 发送邮件 |
| `email:query` | 查询邮件 |
| `email:archive:query` | 查询归档列表 |
| `email:archive` | 归档/取消归档 |
| `star:add` | 添加星标 |
| `star:query` | 查询星标 |
| `star:delete` | 取消星标 |
| `contact:query` | 查询联系人 |
| `contact:add` | 添加联系人 |
| `contact:update` | 更新联系人 |
| `contact:delete` | 删除联系人 |
| `filter:query` | 查询过滤规则 |
| `filter:add` | 添加过滤规则 |
| `filter:update` | 更新过滤规则 |
| `filter:delete` | 删除过滤规则 |

---

## 权限中间件

权限验证在 `mail-worker/src/security/security.js` 中实现。

### 工作流程

```
请求进入
    │
    ▼
检查是否在白名单（exclude）
    │
    ├── 是 → 跳过验证，直接通过
    │
    └── 否
            │
            ▼
    检查 /public 路由
            │
            ├── 是 → 验证公开 Token
            │
            └── 否 → JWT 认证
                    │
                    ▼
            验证 Token 有效性
                    │
                    ├── 失败 → 返回 401
                    │
                    └── 成功
                            │
                            ▼
                    检查是否需要权限（requirePerms）
                            │
                            ├── 否 → 跳过权限检查
                            │
                            └── 是 → 检查用户权限
                                    │
                                    ├── 有权限 → 通过
                                    │
                                    └── 无权限 → 返回 403
                                            │
                                            ▼
                                    管理员绕过检查
```

### 白名单路由

以下路由不需要认证：

```javascript
const exclude = [
    '/login',              // 登录
    '/register',           // 注册
    '/setting/websiteConfig', // 网站公开配置
    '/webhooks',           // Webhooks
    '/init',               // 数据库初始化
    '/public/genToken',    // 生成公开 Token
    '/telegram',           // Telegram 回调
    '/test',               // 测试
    '/oauth/login',        // OAuth 登录
    '/oauth/linuxDo/callback' // OAuth 回调
];
```

### 需要权限的路由

以下路由需要对应权限（除管理员外）：

```javascript
const requirePerms = [
    '/email/send', '/email/delete', '/email/archive', '/email/unarchive',
    '/email/archiveList', '/email/list', '/email/latest', '/email/attList',
    '/email/read', '/email/search',
    '/account/list', '/account/delete', '/account/add', '/account/setName',
    '/account/setAllReceive', '/account/setAsTop',
    '/star/add', '/star/list', '/star/cancel',
    '/my/delete',
    '/analysis/echarts',
    '/role/add', '/role/list', '/role/delete', '/role/tree', '/role/set', '/role/setDefault',
    '/allEmail/list', '/allEmail/delete', '/allEmail/batchDelete', '/allEmail/latest',
    '/setting/setBackground', '/setting/deleteBackground', '/setting/set', '/setting/query',
    '/setting/cleanupTempFiles', '/setting/tempFileStats', '/setting/cleanupRules', '/setting/ruleStats',
    '/user/delete', '/user/setPwd', '/user/setStatus', '/user/setType', '/user/list',
    '/user/resetSendCount', '/user/restore', '/user/setAvailDomain', '/user/setForwardStatus',
    '/user/add', '/user/deleteAccount', '/user/allAccount',
    '/regKey/add', '/regKey/list', '/regKey/delete', '/regKey/clearNotUse', '/regKey/history',
    '/contact/list', '/contact/groupList', '/contact/add', '/contact/update', '/contact/delete',
    '/contact/toggleStar', '/contact/groupAdd', '/contact/groupUpdate', '/contact/groupDelete',
    '/filter/list', '/filter/add', '/filter/update', '/filter/delete', '/filter/toggle',
    '/audit/list', '/audit/detail',
    '/forward-rule/list', '/forward-rule/add', '/forward-rule/update', '/forward-rule/delete', '/forward-rule/toggle',
    '/tg/channels/list', '/tg/channels/add', '/tg/channels/update', '/tg/channels/delete', '/tg/channels/test',
    '/tg/archive'
];
```

---

## 前端权限控制

### 指令方式

使用 `v-perm` 指令控制元素显示：

```html
<template>
  <!-- 需要 email:send 权限才显示 -->
  <el-button v-perm="'email:send'">发送邮件</el-button>

  <!-- 需要多个权限（AND 关系） -->
  <el-button v-perm="['email:send', 'email:query']">发送邮件</el-button>
</template>
```

### 函数方式

使用 `hasPerm()` 函数进行编程式检查：

```javascript
import { hasPerm } from '@/perm/perm';

// 检查单个权限
if (hasPerm('email:send')) {
    // 有权限
}

// 检查多个权限（AND 关系）
if (hasPerm(['email:send', 'email:query'])) {
    // 有所有权限
}
```

### 路由权限

路由根据用户权限动态注册：

```javascript
// 路由配置
const dynamicRoutes = [
    {
        path: '/sent',
        meta: { perm: 'email:send' }
    },
    {
        path: '/all-users',
        meta: { perm: 'user:query' }
    }
];

// 初始化时过滤
function permsToRouter(perms) {
    return dynamicRoutes.filter(route => {
        if (!route.meta?.perm) return true;
        return hasPerm(route.meta.perm);
    });
}
```

---

## 角色配置

### 角色字段说明

| 字段 | 说明 |
|------|------|
| name | 角色名称 |
| key | 角色标识（唯一） |
| description | 角色描述 |
| banEmail | 禁用邮箱域名 |
| banEmailType | 禁用类型（0=禁用列表，1=仅允许列表） |
| availDomain | 可用域名列表 |
| sendCount | 每日发送限制 |
| sendType | 发送计数类型 |
| accountCount | 账号数量限制 |
| isDefault | 是否为默认注册角色 |

### 权限树结构

权限表采用树形结构，`pid` 字段表示父权限 ID：

| permId | name | permKey | pid | type |
|--------|------|---------|-----|------|
| 1 | 邮件管理 | email | 0 | 1 |
| 2 | 发送邮件 | email:send | 1 | 2 |
| 3 | 查询邮件 | email:query | 1 | 2 |
| 4 | 用户管理 | user | 0 | 1 |
| 5 | 查询用户 | user:query | 4 | 2 |
| 6 | 删除用户 | user:delete | 4 | 2 |

---

## 安全机制

### JWT Token

- **存储**: Header `Authorization`
- **有效期**: 30 天
- **刷新**: 每日刷新过期时间
- **并发**: 同一用户最多 10 个 Token

### 密码安全

- **算法**: PBKDF2
- **盐值**: 随机生成，每个用户唯一

### 审计日志

以下操作会记录审计日志：

- 用户登录/登出
- 用户 CRUD 操作
- 角色权限变更
- 系统设置修改
- 邮件删除

---

## 最佳实践

### 1. 最小权限原则

新角色应该只分配必要的权限，不要过度授权。

### 2. 定期审查

定期审查用户角色分配，移除不必要的权限。

### 3. 敏感操作

敏感操作（如删除用户、修改系统设置）应该：
- 要求更高权限级别
- 记录审计日志
- 考虑增加二次确认

### 4. 公开接口

如果需要公开访问某些 API，使用公开 Token 机制，不要完全禁用认证。
