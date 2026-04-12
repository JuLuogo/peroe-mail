import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import os from 'os';
import { pipeline } from 'stream/promises';
import { SESClient, SendEmailCommand, SendRawEmailCommand } from '@aws-sdk/client-ses';

const app = express();
const PORT = process.env.PORT || 3000;

// API 密钥验证（通过环境变量配置）
const API_KEY = process.env.API_KEY;

// AWS SES 配置
const sesClient = new SESClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// 中间件
app.use(cors());
// 增加 JSON body 限制，支持带附件的大邮件（AWS SES 最大支持 30MB，base64 会增大 33%）
app.use(express.json({ limit: '60mb' }));

// API 密钥验证中间件
function validateApiKey(req, res, next) {
  if (!API_KEY) {
    console.warn('Warning: API_KEY not configured, skipping validation');
    return next();
  }

  const authHeader = req.headers['x-api-key'];
  if (!authHeader) {
    console.warn('Request rejected: Missing API key');
    return res.status(401).json({
      success: false,
      error: 'Missing API key'
    });
  }

  // 使用 timingSafeEqual 防止时序攻击
  const expectedKey = Buffer.from(API_KEY);
  const providedKey = Buffer.from(authHeader);

  if (expectedKey.length !== providedKey.length ||
      !crypto.timingSafeEqual(expectedKey, providedKey)) {
    console.warn('Request rejected: Invalid API key');
    return res.status(403).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
}

// 发送邮件接口（无附件）
app.post('/send-email', validateApiKey, async (req, res) => {
  const requestId = crypto.randomUUID().slice(0, 8);

  try {
    const { from, to, subject, text, html, replyTo, inReplyTo, references } = req.body;

    console.log(`[${requestId}] Received email request:`, {
      from,
      to,
      subject,
      hasText: !!text,
      hasHtml: !!html,
      hasInReplyTo: !!inReplyTo,
      hasReferences: !!references
    });

    // 验证必需参数
    if (!from || !to || !subject) {
      console.warn(`[${requestId}] Missing required parameters`);
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: from, to, subject'
      });
    }

    // 如果有 inReplyTo 或 references，使用 Raw Email 发送（支持邮件头）
    if (inReplyTo || references) {
      console.log(`[${requestId}] Using raw email format for thread support`);

      // 构建 MIME 邮件
      const toAddresses = Array.isArray(to) ? to.join(', ') : to;
      const replyToAddresses = replyTo
        ? (Array.isArray(replyTo) ? replyTo.join(', ') : replyTo)
        : null;

      let mimeHeaders = [
        `From: ${from}`,
        `To: ${toAddresses}`,
        `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`
      ];

      // 添加 Thread 头
      if (inReplyTo) {
        mimeHeaders.push(`In-Reply-To: ${inReplyTo}`);
      }
      if (references) {
        if (Array.isArray(references)) {
          mimeHeaders.push(`References: ${references.join(' ')}`);
        } else {
          mimeHeaders.push(`References: ${references}`);
        }
      }

      // 添加回复地址
      if (replyToAddresses) {
        mimeHeaders.push(`Reply-To: ${replyToAddresses}`);
      }

      // 构建邮件内容
      const htmlContent = html || (text ? `<pre>${text}</pre>` : '');
      const rawMessage = [
        ...mimeHeaders,
        '',
        htmlContent
      ].join('\r\n');

      console.log(`[${requestId}] Sending raw email...`);

      const params = {
        RawMessage: {
          Data: Buffer.from(rawMessage, 'utf-8'),
        },
      };

      // 如果有回复地址
      if (replyToAddresses) {
        params.FromEmailAddress = from;
      } else {
        params.FromEmailAddress = from;
      }

      const command = new SendRawEmailCommand(params);
      const result = await sesClient.send(command);

      console.log(`[${requestId}] Email sent successfully. MessageId: ${result.MessageId}`);

      return res.json({
        success: true,
        messageId: result.MessageId,
      });
    }

    // 标准 SendEmail（无线程头）
    const params = {
      Source: from,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {},
      },
    };

    // 添加文本正文
    if (text) {
      params.Message.Body.Text = {
        Data: text,
        Charset: 'UTF-8',
      };
    }

    // 添加 HTML 正文
    if (html) {
      params.Message.Body.Html = {
        Data: html,
        Charset: 'UTF-8',
      };
    }

    // 添加回复地址
    if (replyTo) {
      params.ReplyToAddresses = Array.isArray(replyTo) ? replyTo : [replyTo];
    }

    console.log(`[${requestId}] Sending standard email...`);

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    console.log(`[${requestId}] Email sent successfully. MessageId: ${result.MessageId}`);

    res.json({
      success: true,
      messageId: result.MessageId,
    });
  } catch (error) {
    console.error(`[${requestId}] Error sending email:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// 发送带附件的原始邮件接口
app.post('/send-raw-email', validateApiKey, async (_req, res) => {
  const requestId = crypto.randomUUID().slice(0, 8);
  // 记录本次请求的临时文件，用于最后清理
  const tempFiles = [];

  try {
    const { from, to, rawMessage, attachments, subject, text, html } = _req.body;

    console.log(`[${requestId}] Received raw email request:`, {
      from,
      to,
      hasRawMessage: !!rawMessage,
      attachmentsCount: attachments?.length || 0
    });

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: from, to' });
    }

    let rawBuffer;

    if (attachments && attachments.length > 0) {
      console.log(`[${requestId}] Downloading ${attachments.length} attachments to temp dir...`);

      const downloadedAttachments = [];

      for (const att of attachments) {
        // 为每个附件创建临时文件
        const tmpFile = path.join(os.tmpdir(), `mail-att-${requestId}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
        tempFiles.push(tmpFile);

        try {
          console.log(`[${requestId}] Downloading: ${att.url}`);

          const response = await fetch(att.url, {
            signal: AbortSignal.timeout(60000), // 60秒超时
          });

          if (!response.ok) {
            throw new Error(`Failed to download ${att.url}: ${response.status} ${response.statusText}`);
          }

          // 用 stream 写入临时文件，不占内存
          const fileStream = fs.createWriteStream(tmpFile);
          await pipeline(response.body, fileStream);

          const stat = await fsp.stat(tmpFile);
          console.log(`[${requestId}] Downloaded: ${att.filename}, size: ${stat.size}`);

          downloadedAttachments.push({
            filename: att.filename,
            contentType: att.contentType,
            contentId: att.contentId,
            tmpFile, // 记录临时文件路径，后面读取用
          });
        } catch (downloadError) {
          console.error(`[${requestId}] Failed to download attachment:`, downloadError);
          return res.status(500).json({
            success: false,
            error: `Failed to download attachment: ${downloadError.message}`
          });
        }
      }

      // 构建 MIME，从临时文件读取内容
      rawBuffer = await buildMimeEmailFromFiles({
        from, to, subject: subject || '(No Subject)', text, html,
        attachments: downloadedAttachments,
      });

      console.log(`[${requestId}] MIME email built, size: ${rawBuffer.length}`);

    } else if (rawMessage) {
      rawBuffer = Buffer.from(rawMessage, 'base64');
    } else {
      return res.status(400).json({ success: false, error: 'Missing rawMessage or attachments' });
    }

    console.log(`[${requestId}] Sending raw email...`);

    const params = {
      RawMessage: { Data: rawBuffer },
      FromEmailAddress: from,
    };

    const command = new SendRawEmailCommand(params);
    const result = await sesClient.send(command);

    console.log(`[${requestId}] Email sent successfully. MessageId: ${result.MessageId}`);

    res.json({ success: true, messageId: result.MessageId });

  } catch (error) {
    console.error(`[${requestId}] Error sending raw email:`, error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    // 无论成功失败，都清理临时文件
    for (const tmpFile of tempFiles) {
      try {
        await fsp.unlink(tmpFile);
        console.log(`[${requestId}] Cleaned up: ${tmpFile}`);
      } catch {
        // 文件可能已不存在，忽略
      }
    }
  }
});

/**
 * 从临时文件构建 MIME 邮件（附件从磁盘读取，避免全量内存占用）
 */
async function buildMimeEmailFromFiles({ from, to, subject, text, html, attachments }) {
  const boundary = `----=_NextPart_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  const altBoundary = `----=_AltPart_${Date.now()}`;
  const toAddresses = Array.isArray(to) ? to.join(', ') : to;

  const parts = [];

  parts.push(`From: ${from}`);
  parts.push(`To: ${toAddresses}`);
  parts.push(`Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`);
  parts.push(`MIME-Version: 1.0`);
  parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  parts.push('');

  parts.push(`--${boundary}`);
  parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
  parts.push('');

  if (text) {
    parts.push(`--${altBoundary}`);
    parts.push(`Content-Type: text/plain; charset=UTF-8`);
    parts.push(`Content-Transfer-Encoding: 8bit`);
    parts.push('');
    parts.push(text);
  }
  if (html) {
    parts.push(`--${altBoundary}`);
    parts.push(`Content-Type: text/html; charset=UTF-8`);
    parts.push(`Content-Transfer-Encoding: 8bit`);
    parts.push('');
    parts.push(html);
  }

  parts.push(`--${altBoundary}--`);
  parts.push('');

  // 附件部分：从临时文件读取
  for (const att of attachments) {
    const filename = att.filename || 'attachment';
    const contentType = att.contentType || 'application/octet-stream';

    // 从磁盘读取并 base64 编码
    const content = await fsp.readFile(att.tmpFile);
    const base64Content = content.toString('base64');
    const formattedBase64 = base64Content.match(/.{1,76}/g)?.join('\r\n') || base64Content;

    parts.push(`--${boundary}`);
    parts.push(`Content-Type: ${contentType}; name="${filename}"`);
    parts.push(`Content-Transfer-Encoding: base64`);
    parts.push(`Content-Disposition: attachment; filename="${filename}"`);
    if (att.contentId) {
      parts.push(`Content-ID: <${att.contentId}>`);
    }
    parts.push('');
    parts.push(formattedBase64);
    parts.push('');
  }

  parts.push(`--${boundary}--`);

  return Buffer.from(parts.join('\r\n'), 'utf-8');
}

// 健康检查（无需认证）
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`Local SES API server running on port ${PORT}`);
  console.log(`AWS Region: ${process.env.AWS_REGION || 'us-east-1'}`);
  console.log(`API Key configured: ${!!API_KEY}`);
});
