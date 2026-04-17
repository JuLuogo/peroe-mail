# 部署指南

本文档详细介绍 Peroe Mail 项目的部署方式。

## 部署方式

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| GitHub Actions | 自动部署 | 生产环境，推荐 |
| 手动部署 | 使用 Wrangler CLI | 测试环境 / 手动部署 |

---

## 方式一：GitHub Actions 自动部署

### 前置条件

1. GitHub 账户
2. Cloudflare 账户
3. 一个 Cloudflare Workers 支持的域名（可选）

### 配置步骤

#### 1. Fork 仓库

访问 [Peroe Mail GitHub 仓库](https://github.com/maillab/cloud-mail) 点击 Fork。

#### 2. 配置 GitHub Secrets

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加以下 Secrets：

| Secret 名称 | 必需 | 说明 |
|-------------|------|------|
| `CLOUDFLARE_API_TOKEN` | ✅ | Cloudflare API 令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | ✅ | Cloudflare 账户 ID |
| `DOMAIN` | ✅ | 邮件域名（JSON 数组格式） |
| `ADMIN` | ✅ | 管理员邮箱地址 |
| `JWT_SECRET` | ✅ | JWT 密钥（建议 32 位以上随机字符串） |
| `D1_DATABASE_ID` | ❌ | D1 数据库 ID（未配置则自动创建） |
| `KV_NAMESPACE_ID` | ❌ | KV 命名空间 ID（未配置则自动创建） |
| `R2_BUCKET_NAME` | ❌ | R2 存储桶名称 |
| `CUSTOM_DOMAIN` | ❌ | 自定义域名 |
| `NAME` | ❌ | 项目名称（默认 cloud-mail） |
| `LINUXDO_CLIENT_ID` | ❌ | LinuxDo OAuth Client ID |
| `LINUXDO_CLIENT_SECRET` | ❌ | LinuxDo OAuth Client Secret |
| `LINUXDO_CALLBACK_URL` | ❌ | LinuxDo OAuth 回调 URL |
| `LINUXDO_SWITCH` | ❌ | LinuxDo OAuth 开关（设为 `true` 启用） |
| `QUEUE_ENABLED` | ❌ | 是否启用队列（默认 true） |
| `QUEUE_NAME` | ❌ | 队列名称（默认 email-queue） |
| `LOCAL_SES_API_URL` | ❌ | 本地 SES API 地址 |
| `LOCAL_SES_API_KEY` | ❌ | 本地 SES API 密钥 |

#### 3. 配置 GitHub Variables（可选）

在 **Settings → Secrets and variables → Actions → Variables** 中添加：

| Variable 名称 | 说明 |
|--------------|------|
| `NAME` | 项目名称（可选） |
| `CUSTOM_DOMAIN` | 自定义域名（可选） |
| `PROJECT_LINK` | 项目链接（可选） |

#### 4. 触发部署

推送代码到 `main` 分支，或在 Actions 页面手动运行工作流。

### 获取 Cloudflare 配置

#### Cloudflare API Token

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. 点击 **Create Token**
3. 选择 **Edit Cloudflare Workers** 模板
4. 添加以下权限：
   - `Account > Workers Scripts: Edit`
   - `Account > KV Namespaces: Edit`
   - `Account > D1 Databases: Edit`
   - `Account > R2 Buckets: Edit`
   - `Account > Queues: Edit`
5. 创建并复制 Token

#### Cloudflare Account ID

在 Cloudflare Dashboard 右下角或 URL 中获取：
`https://dash.cloudflare.com/{account_id}/...`

### 部署流程

GitHub Actions 自动执行以下步骤：

1. **Checkout** - 检出代码
2. **Setup pnpm** - 安装 pnpm
3. **Setup Node.js** - 安装 Node.js
4. **Clear Cache** - 清理前端缓存
5. **Install Dependencies** - 安装后端依赖
6. **Disable Telemetry** - 禁用 Wrangler 遥测
7. **Setup Environment** - 配置环境变量
8. **Setup KV** - 创建/配置 KV 命名空间
9. **Setup D1** - 创建/配置 D1 数据库
10. **Setup Queue** - 创建邮件队列
11. **Build Frontend** - 构建前端
12. **Deploy** - 部署到 Cloudflare Workers
13. **Initialize Database** - 初始化数据库

### 验证部署

部署完成后，访问以下地址验证：

```
https://<worker-subdomain>.workers.dev
```

或您的自定义域名。

---

## 方式二：手动部署

### 前置条件

1. Node.js 18+
2. pnpm 8+
3. Wrangler CLI: `npm install -g wrangler`
4. Cloudflare 账户

### 部署步骤

#### 1. 克隆并安装

```bash
git clone https://github.com/maillab/cloud-mail.git
cd cloud-mail/mail-worker
pnpm install
```

#### 2. 配置 wrangler.toml

```toml
name = "cloud-mail"
main = "src/index.js"
compatibility_date = "2025-06-04"

# D1 数据库
[[d1_databases]]
binding = "db"
database_name = "cloud-mail"
database_id = "<your-database-id>"

# KV 命名空间
[[kv_namespaces]]
binding = "kv"
id = "<your-kv-namespace-id>"

# R2 存储桶（可选）
[[r2_buckets]]
binding = "r2"
bucket_name = "<your-bucket-name>"

# 静态资源
[assets]
binding = "assets"
directory = "./dist"
not_found_handling = "single-page-application"

# 定时任务（每天 UTC 16:00）
[triggers]
crons = ["0 16 * * *"]

# 环境变量
[vars]
domain = ["example.com"]
admin = "admin@example.com"
jwt_secret = "<your-jwt-secret>"
```

#### 3. 创建 Cloudflare 资源

```bash
# 登录 Cloudflare
pnpm wrangler login

# 创建 D1 数据库
pnpm wrangler d1 create cloud-mail

# 创建 KV 命名空间
pnpm wrangler kv namespace create cloud-mail

# 创建 R2 存储桶（可选）
pnpm wrangler r2 bucket create cloud-mail-attachments
```

#### 4. 构建前端

```bash
cd ../mail-vue
pnpm install
pnpm build
```

#### 5. 部署

```bash
cd ../mail-worker
pnpm wrangler deploy
```

#### 6. 初始化数据库

```bash
curl https://<your-worker-url>/api/init/<your-jwt-secret>
```

---

## Docker 部署本地 SES API

如果启用队列发送，需要部署本地 SES API。

### Docker Compose 方式

```bash
cd local-ses-api

# 复制环境配置
cp .env.example .env

# 编辑配置
vim .env

# 启动服务
docker-compose up -d
```

### 环境变量

```env
PORT=3000
API_KEY=your-secure-api-key
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
FROM_EMAIL=noreply@example.com
FROM_NAME=Peroe Mail
```

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `POST /send-email` | 发送单封邮件 | 需要 `Authorization: Bearer <api-key>` header |
| `POST /batch-send` | 批量发送 | 同样需要认证 |

---

## DNS 配置

如果使用自定义域名，需要配置 DNS。

### 域名配置

| 记录类型 | 名称 | 内容 | 说明 |
|---------|------|------|------|
| CNAME | @ | `<worker-subdomain>.workers.dev` | 主域名 |
| CNAME | www | `<worker-subdomain>.workers.dev` | www 子域名 |

### MX 记录配置（邮件接收）

| 记录类型 | 名称 | 内容 | 优先级 |
|---------|------|------|--------|
| MX | @ | mail.example.com | 10 |
| MX | @ | feedbackmail.net | 20 |

### SPF 记录

```
v=spf1 include:mail.example.com ~all
```

### DKIM 记录

在 DNS 中添加域名的 DKIM 记录。

---

## 邮件接收配置

Cloudflare Workers 通过邮件路由接收邮件。

### 1. 配置邮件路由

在 Cloudflare Dashboard → Email → Email Routing：

1. 添加域名
2. 配置 MX 记录指向 Cloudflare
3. 创建路由规则：
   - 匹配：`*@example.com`
   - 目标：`<worker-subdomain>.workers.dev`

### 2. 配置 Worker 邮件处理

Worker 的 `email()` 函数会自动处理收到的邮件。

---

## 环境变量参考

### 必填变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `domain` | 邮件域名 | `["example.com"]` |
| `admin` | 管理员邮箱 | `admin@example.com` |
| `jwt_secret` | JWT 密钥 | 随机字符串 |

### 邮件发送配置

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `orm_log` | `false` | 是否输出 SQL 日志 |
| `resendTokens` | - | Resend API Token（系统设置中配置） |
| `sesAccessKey` | - | AWS SES Access Key |
| `sesSecretKey` | - | AWS SES Secret Key |
| `sesRegion` | - | AWS SES 区域 |
| `sesEnabled` | `false` | 是否启用 SES |

### OAuth 配置

| 变量名 | 说明 |
|--------|------|
| `linuxdo_switch` | 启用 LinuxDo OAuth |
| `linuxdo_client_id` | LinuxDo OAuth Client ID |
| `linuxdo_client_secret` | LinuxDo OAuth Client Secret |
| `linuxdo_callback_url` | OAuth 回调 URL |

### 其他配置

| 变量名 | 说明 |
|--------|------|
| `project_link` | 项目链接（显示在设置页面） |

---

## 故障排查

### 部署失败

1. 检查 GitHub Secrets 配置是否正确
2. 检查 Cloudflare API Token 权限
3. 查看 Actions 日志定位问题

### 数据库初始化失败

```bash
# 手动初始化
curl https://<worker-url>/api/init/<jwt-secret>
```

### 邮件发送失败

1. 检查 Resend/SES 配置是否正确
2. 检查 API Token 是否有效
3. 查看 Worker 日志

### 邮件接收失败

1. 检查 MX 记录配置
2. 检查 DNS 传播（可能需要 24-48 小时）
3. 检查 Worker 日志

### 附件无法访问

1. 检查 R2 配置是否正确
2. 检查 R2 自定义域名
3. 检查附件 Key 是否正确

---

## 安全建议

1. **JWT Secret**: 使用足够长的随机字符串
2. **API Token**: 不要泄露 Cloudflare API Token
3. **HTTPS**: 生产环境务必使用 HTTPS
4. **域名验证**: 配置 SPF、DKIM、DMARC 记录
