# Peroe Mail 项目安全审计报告

**审计日期**: 2026年4月17日  
**审计范围**: 完整项目代码（mail-worker + mail-vue）  
**风险等级**: 高-中-低三级分类  

---

## 一、高危漏洞（Critical/High Risk）

### 1. SQL注入风险 ⚠️ HIGH

**位置**: 
- `mail-worker/src/dao/analysis-dao.js` 第5-47行
- `mail-worker/src/service/att-service.js` 第233-265行

**问题描述**:  
直接使用字符串拼接SQL语句：
```javascript
// 危险示例 - analysis-dao.js
const { results } = await c.env.db.prepare(`
    SELECT ... FROM email where status != ${emailConst.status.SAVING}
`).all();
```

**影响**: 攻击者可操控输入执行任意SQL，导致数据泄露/篡改/删除  
**修复**: 使用参数化查询或Drizzle ORM的条件查询

---

### 2. 开放式CORS配置 ⚠️ MEDIUM

**位置**: `mail-worker/src/hono/hono.js` 第7行

**问题描述**: 完全开放CORS：
```javascript
app.use('*', cors());  // 允许任何来源
```

**影响**: 增加CSRF攻击风险，API可被恶意网站跨域调用  
**修复**: 配置明确的允许来源列表

---

### 3. 路径遍历风险 ⚠️ MEDIUM

**位置**: `mail-worker/src/api/r2-api.js` 第4-19行

**问题描述**: 直接从URL获取对象key，未验证路径：
```javascript
const key = c.req.path.split('/oss/')[1];
// 可能访问 ../../../etc/passwd
```

**影响**: 可能访问非预期的系统文件  
**修复**: 添加路径验证，拒绝包含`..`的路径

---

## 二、中危漏洞（Medium Risk）

### 4. JWT密钥管理问题 ⚠️ MEDIUM

**位置**: 
- `mail-worker/wrangler.toml` 第36行
- `mail-worker/src/utils/jwt-utils.js`

**问题描述**: 密钥使用空字符串示例，无强度验证  
**影响**: 弱密钥易被暴力破解，可伪造JWT令牌  
**修复**: 强制要求32字节以上随机字符串

---

### 5. 缺少API速率限制 ⚠️ MEDIUM

**位置**: 全局API端点（登录、注册、邮件发送）

**问题描述**: 无速率限制保护  
**影响**: 易受暴力破解、DDoS、垃圾邮件滥用  
**修复**: 实现IP级别的滑动窗口限流

---

### 6. 密码哈希算法降级 ⚠️ MEDIUM

**位置**: `mail-worker/src/utils/crypto-utils.js` 第44-58行

**问题描述**: 为兼容保留SHA-256哈希（相比PBKDF2更弱）：
```javascript
// 兼容旧版用户
const sha256Hash = await this._legacySha256Hash(inputPassword, salt);
```

**影响**: 降级到易受暴力破解的算法  
**修复**: 制定迁移计划，强制使用PBKDF2

---

## 三、低危问题（Low Risk）

### 7. 敏感信息泄露风险

**位置**: 多处`console.log`和`console.error`

**建议**: 生产环境使用日志级别控制，避免输出敏感数据

---

### 8. 密码策略过弱

**位置**: `mail-worker/src/service/login-service.js` 第56-62行

**问题**: 密码最小长度仅为6字符  
**建议**: 提升至8-12字符，要求复杂度组合

---

### 9. 缺失安全响应头

**位置**: `mail-worker/src/hono/hono.js`

**建议**: 添加以下安全头：
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security
- Content-Security-Policy

---

## 四、修复优先级

### 立即修复（1-3天）
1. 修复所有SQL注入漏洞
2. 限制CORS到具体域名
3. 添加R2路径验证

### 短期修复（1-2周）
1. 实施API速率限制
2. 加强JWT密钥验证
3. 禁用旧版SHA-256哈希

### 长期改进（1个月）
1. 统一安全响应头
2. 加强密码策略
3. 完善日志和监控
4. 定期安全审计

---

## 五、代码示例

### 安全CORS配置
```javascript
app.use('*', cors({
  origin: ['https://yourdomain.com'],
  credentials: true,
  allowHeaders: ['Authorization', 'Content-Type'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
}));
```

### 速率限制中间件
```javascript
const rateLimiter = new Map();

app.use('/login', async (c, next) => {
  const ip = c.req.header('cf-connecting-ip');
  const key = `login:${ip}`;
  const now = Date.now();
  const window = 5 * 60 * 1000; // 5分钟
  const max = 5; // 最多5次
  
  const attempts = rateLimiter.get(key) || [];
  const recent = attempts.filter(t => now - t < window);
  
  if (recent.length >= max) {
    return c.json({ error: 'Too many attempts' }, 429);
  }
  
  recent.push(now);
  rateLimiter.set(key, recent);
  await next();
});
```

### 安全响应头
```javascript
app.use('*', async (c, next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'self'");
  await next();
});
```

---

**建议复查**: 每季度进行一次安全审计  
**联系方式**: 如有疑问请联系开发团队
