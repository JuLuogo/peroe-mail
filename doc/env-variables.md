# 环境变量配置

本文档详细介绍 Cloud Mail 项目所有可配置的环境变量。

---

## GitHub Actions 部署变量

### 必填变量

| 变量名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare API 令牌（需要 Workers、D1、KV、R2 权限） | `Abc123...` |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare 账户 ID | `1a2b3c4d5e6f...` |
| `DOMAIN` | Secret | 邮件域名（JSON 数组格式） | `["example.com"]` |
| `ADMIN` | Secret | 管理员邮箱地址 | `admin@example.com` |
| `JWT_SECRET` | Secret | JWT 令牌密钥（建议 32 位以上随机字符串） | `your-secret-key-here` |

### 可选变量

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `NAME` | Secret/Variable | `cloud-mail` | 项目名称，用于创建 D1/KV 数据库时命名 |
| `CUSTOM_DOMAIN` | Secret/Variable | - | 自定义域名（未配置则使用 workers.dev 域名） |


### 邮件发送配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `QUEUE_ENABLED` | Secret/Variable | `true` | 是否启用 Cloudflare Queues 异步邮件发送 |
| `QUEUE_NAME` | Secret/Variable | `email-queue` | Cloudflare Queue 队列名称 |
| `LOCAL_SES_API_URL` | Secret/Variable | - | 本地 SES API 地址（启用 Queue 时必填） |
| `LOCAL_SES_API_KEY` | Secret/Variable | - | 本地 SES API 密钥 |
| `SES_ACCESS_KEY` | Secret/Variable | - | AWS SES Access Key（暂未使用） |
| `SES_SECRET_KEY` | Secret/Variable | - | AWS SES Secret Key（暂未使用） |
| `SES_REGION` | Secret/Variable | - | AWS SES 区域（暂未使用） |
| `SES_ENABLED` | Secret/Variable | - | 是否启用 SES（暂未使用） |


### 第三方登录配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `LINUXDO_CLIENT_ID` | Secret/Variable | - | LinuxDo OAuth 客户端 ID |
| `LINUXDO_CLIENT_SECRET` | Secret/Variable | - | LinuxDo OAuth 客户端密钥 |
| `LINUXDO_CALLBACK_URL` | Secret/Variable | - | LinuxDo OAuth 回调地址 |
| `LINUXDO_SWITCH` | Secret/Variable | - | LinuxDo 登录开关（设为 `true` 启用） |


### 对象存储配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `R2_BUCKET_NAME` | Secret/Variable | - | Cloudflare R2 存储桶名称（用于存储邮件附件） |


### 其他配置

| 变量名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `PROJECT_LINK` | Secret/Variable | - | 项目链接（显示在系统设置中） |


---

## wrangler.toml 配置

### 必填配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `name` | string | Worker 名称 |
| `main` | string | 入口文件路径 |
| `compatibility_date` | string | Cloudflare Workers 兼容性日期 |

### 可选配置

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `observability.enabled` | boolean | `true` | 是否启用可观测性 |
| `assets.binding` | string | `assets` | 静态资源绑定名 |
| `assets.directory` | string | `./dist` | 前端构建产物目录 |
| `assets.not_found_handling` | string | `single-page-application` | 404 处理方式 |
| `triggers.crons` | array | `["0 16 * * *"]` | 定时任务 Cron 表达式（每天 00:00 执行） |

### 路由配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `[[routes]].pattern` | string | 自定义域名 |
| `[[routes]].custom_domain` | boolean | 是否启用自定义域名 |

### 数据库绑定

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `[[d1_databases]].binding` | string | D1 数据库绑定名（固定为 `db`） |
| `[[d1_databases]].database_name` | string | D1 数据库名称 |
| `[[d1_databases]].database_id` | string | D1 数据库 ID |

### KV 绑定

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `[[kv_namespaces]].binding` | string | KV 绑定名（固定为 `kv`） |
| `[[kv_namespaces]].id` | string | KV 命名空间 ID |

### R2 绑定

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `[[r2_buckets]].binding` | string | R2 绑定名（固定为 `r2`） |
| `[[r2_buckets]].bucket_name` | string | R2 存储桶名称 |

### Queue 配置

| 配置项 | 类型 | 说明 |
|--------|------|------|
| `[[queue_producers]].binding` | string | Queue 绑定名（固定为 `EMAIL_QUEUE`） |
| `[[queue_producers]].queue` | string | Queue 队列名称 |


---

## 环境变量参考速查

### 最小配置（仅部署）

```
CLOUDFLARE_API_TOKEN      ✅ 必填
CLOUDFLARE_ACCOUNT_ID     ✅ 必填
DOMAIN                    ✅ 必填
ADMIN                     ✅ 必填
JWT_SECRET                ✅ 必填
```

### 完整配置（启用全部功能）

```
# 基础
CLOUDFLARE_API_TOKEN      ✅ 必填
CLOUDFLARE_ACCOUNT_ID    ✅ 必填
DOMAIN                    ✅ 必填
ADMIN                     ✅ 必填
JWT_SECRET                ✅ 必填
NAME                      可选
CUSTOM_DOMAIN             可选

# 邮件队列
QUEUE_ENABLED             可选（默认 true）
QUEUE_NAME                可选（默认 email-queue）
LOCAL_SES_API_URL         启用队列时必填
LOCAL_SES_API_KEY         可选

# 附件存储
R2_BUCKET_NAME            可选

# 第三方登录
LINUXDO_CLIENT_ID         可选
LINUXDO_CLIENT_SECRET     可选
LINUXDO_CALLBACK_URL      可选
LINUXDO_SWITCH            可选

# 其他
PROJECT_LINK              可选
```

---

## 获取变量途径

### Cloudflare API Token

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 创建新令牌，选择"编辑 Cloudflare Workers"模板
3. 添加 D1、KV、R2、Queues 相关权限
4. 保存并复制令牌

### Cloudflare Account ID

在 Cloudflare 仪表盘 URL 中获取：`https://dash.cloudflare.com/{account_id}/...`

### D1 / KV / R2 IDs

可通过以下命令获取：
```bash
# D1
pnpm wrangler d1 list --json

# KV
pnpm wrangler kv namespace list

# R2
pnpm wrangler r2 bucket list
```

或直接在 Cloudflare Dashboard 的对应资源页面查看。

### Queue 自动创建

使用 `[[queue_producers]]` 配置时，Wrangler 会自动创建队列，无需手动创建。
