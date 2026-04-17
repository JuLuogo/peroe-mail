# 开发指南

本文档提供 Peroe Mail 项目的本地开发指导。

## 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | 18+ | 推荐使用最新 LTS 版本 |
| pnpm | 8+ | 包管理器 |
| Wrangler | 最新版 | Cloudflare Workers CLI |

## 项目克隆

```bash
git clone https://github.com/maillab/cloud-mail.git
cd cloud-mail
```

## 后端开发 (mail-worker)

### 安装依赖

```bash
cd mail-worker
pnpm install
```

### 配置文件

创建开发配置文件 `wrangler-dev.toml`：

```toml
name = "peroe-mail"
main = "src/index.js"
compatibility_date = "2025-06-04"

# D1 数据库（本地开发需要先创建）
[[d1_databases]]
binding = "db"
database_name = "cloud-mail"
database_id = "<your-d1-database-id>"

# KV 命名空间
[[kv_namespaces]]
binding = "kv"
id = "<your-kv-namespace-id>"

# R2 存储桶（可选）
[[r2_buckets]]
binding = "r2"
bucket_name = "<your-r2-bucket-name>"

# 环境变量
[vars]
domain = ["localhost"]
admin = "admin@example.com"
jwt_secret = "dev-secret-key-change-in-production"
orm_log = true
```

### 创建本地数据库

```bash
# 创建 D1 数据库
pnpm wrangler d1 create cloud-mail-dev

# 创建 KV 命名空间
pnpm wrangler kv namespace create cloud-mail-dev
```

### 启动开发服务器

```bash
# 启动本地开发服务器
pnpm dev

# 或使用
pnpm wrangler dev --config wrangler-dev.toml
```

开发服务器默认运行在 `http://localhost:8787`。

### 运行测试

```bash
pnpm vitest run
```

## 前端开发 (mail-vue)

### 安装依赖

```bash
cd mail-vue
pnpm install
```

### 配置文件

创建开发环境配置 `.env.dev`：

```env
NODE_ENV = 'development'
VITE_APP_TITLE = 'Peroe Mail'
VITE_BASE_URL = 'http://localhost:8787/api'
VITE_PWA_NAME = 'Peroe Mail Dev'
```

### 启动开发服务器

```bash
# 方式一：独立开发模式（需要后端运行）
pnpm dev

# 方式二：连接远程 API
pnpm remote
```

前端开发服务器默认运行在 `http://localhost:3001`。

### 构建

```bash
# 生产构建
pnpm build

# EO 环境构建
pnpm eo

# 预览构建结果
pnpm preview
```

## 本地 SES API（可选）

当开发需要测试邮件发送功能时，可以使用本地 SES API。

### Docker 方式

```bash
cd local-ses-api

# 复制环境配置文件
cp .env.example .env

# 启动服务
docker-compose up -d
```

### 配置

编辑 `local-ses-api/.env`：

```env
PORT=3000
API_KEY=your-api-key
# 邮件发送配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

### API 端点

本地 SES API 提供以下端点：

| 端点 | 方法 | 说明 |
|------|------|------|
| `/send-email` | POST | 发送邮件 |
| `/batch-send` | POST | 批量发送 |

## 代码规范

### 后端 (mail-worker)

**格式化**: 使用 Prettier

```json
// .prettierrc
{
  "printWidth": 140,
  "singleQuote": true,
  "semi": true,
  "useTabs": true
}
```

**Git 提交**: 使用 Conventional Commits

```
feat: 新功能
fix: 修复 bug
refactor: 代码重构
docs: 文档更新
chore: 构建过程或辅助工具的变动
```

### 前端 (mail-vue)

**组件规范**:
- 组件文件放在 `src/views/` 或 `src/components/` 目录
- 组件名称使用 PascalCase
- Props 使用 camelCase

```vue
<!-- Good -->
<template>
  <el-button type="primary">发送</el-button>
</template>

<script setup>
// ...
</script>
```

**样式规范**:
- 使用 Element Plus 组件库
- 样式文件使用 `<style lang="scss" scoped>`
- 避免使用行内样式

## 目录开发指南

### 新增 API 路由

1. 在 `mail-worker/src/api/` 创建路由文件

```javascript
// mail-worker/src/api/example-api.js
import app from '../hono/hono';
import result from '../model/result';
import exampleService from '../service/example-service';
import userContext from '../security/user-context';

app.get('/example/list', async (c) => {
    const data = await exampleService.list(c, c.req.query());
    return c.json(result.ok(data));
});
```

2. 在 `mail-worker/src/hono/hono.js` 中注册路由

```javascript
import './example-api';
```

### 新增 Service

```javascript
// mail-worker/src/service/example-service.js
import exampleDao from '../dao/example-dao';
import { eq } from 'drizzle-orm';

export default {
    async list(c, query) {
        const { page = 1, pageSize = 20 } = query;
        return await exampleDao.list(c, { page, pageSize });
    }
};
```

### 新增 DAO

```javascript
// mail-worker/src/dao/example-dao.js
import { db, exampleEntity } from '../entity/orm';

export default {
    async list(c, { page, pageSize }) {
        const offset = (page - 1) * pageSize;
        return await db(c)
            .select()
            .from(exampleEntity)
            .limit(pageSize)
            .offset(offset);
    }
};
```

### 新增 Entity

```javascript
// mail-worker/src/entity/example.js
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const example = sqliteTable('example', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    createTime: text('create_time')
});

export default example;
```

### 新增前端页面

1. 在 `mail-vue/src/views/` 创建页面组件

```vue
<!-- mail-vue/src/views/example/index.vue -->
<template>
  <div class="example-page">
    <h1>示例页面</h1>
  </div>
</template>

<script setup>
import { ref } from 'vue';
</script>

<style lang="scss" scoped>
.example-page {
  padding: 20px;
}
</style>
```

2. 在 `mail-vue/src/router/index.js` 添加路由

```javascript
{
    path: '/example',
    component: () => import('../views/example/index.vue'),
    meta: { title: '示例', perm: 'example:query' }
}
```

3. 在 `mail-vue/src/request/` 添加 API 请求

```javascript
// mail-vue/src/request/example.js
import request from '../axios';

export const exampleApi = {
    list: (params) => request.get('/example/list', { params })
};
```

## 调试技巧

### 后端调试

1. **查看日志**: 使用 `console.log` 输出日志
2. **KV 查看**: 使用 Wrangler CLI 查看 KV 内容

```bash
pnpm wrangler kv:key list --namespace-id=<id>
```

3. **D1 查询**: 使用 Wrangler CLI 查询 D1

```bash
pnpm wrangler d1 execute cloud-mail --local --command="SELECT * FROM user"
```

### 前端调试

1. **Vue DevTools**: 使用 Vue DevTools 扩展
2. **网络请求**: 使用浏览器开发者工具查看 API 请求
3. **状态管理**: 使用 Pinia DevTools

## 常见问题

### 1. Wrangler 连接超时

如果本地开发服务器启动缓慢或超时，可以尝试：

```bash
pnpm wrangler dev --local
```

### 2. 数据库迁移失败

手动执行数据库迁移：

```bash
curl http://localhost:8787/api/init/<your-jwt-secret>
```

### 3. 前端 API 请求失败

检查：
- 后端开发服务器是否运行
- `.env.dev` 中的 `VITE_BASE_URL` 是否正确
- CORS 配置是否正确

### 4. R2 附件无法访问

检查：
- R2 bucket 是否正确配置
- R2 自定义域名是否设置
- 附件 Key 是否正确

## 相关资源

- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Hono 框架文档](https://hono.dev/)
- [Drizzle ORM 文档](https://orm.drizzle.team/)
- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
