import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
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

  try {
    const { from, to, rawMessage, attachments, subject, text, html } = _req.body;

    console.log(`[${requestId}] Received raw email request:`, {
      from,
      to,
      hasRawMessage: !!rawMessage,
      hasAttachments: !!attachments,
      attachmentsCount: attachments?.length || 0
    });

    // 验证必需参数
    if (!from || !to) {
      console.warn(`[${requestId}] Missing required parameters`);
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: from, to'
      });
    }

    let rawBuffer;

    // URL 传输模式：通过 URL 下载附件并构建 MIME 邮件
    if (attachments && attachments.length > 0) {
      console.log(`[${requestId}] Using URL mode: downloading ${attachments.length} attachments...`);

      // 下载所有附件
      const downloadedAttachments = [];
      for (const att of attachments) {
        try {
          console.log(`[${requestId}] Downloading: ${att.url}`);
          const response = await fetch(att.url);
          if (!response.ok) {
            throw new Error(`Failed to download ${att.url}: ${response.status} ${response.statusText}`);
          }
          const buffer = await response.arrayBuffer();
          downloadedAttachments.push({
            filename: att.filename,
            contentType: att.contentType,
            contentId: att.contentId,
            content: Buffer.from(buffer)
          });
          console.log(`[${requestId}] Downloaded: ${att.filename}, size: ${buffer.byteLength}`);
        } catch (downloadError) {
          console.error(`[${requestId}] Failed to download attachment:`, downloadError);
          return res.status(500).json({
            success: false,
            error: `Failed to download attachment: ${downloadError.message}`
          });
        }
      }

      // 构建 MIME 邮件
      rawBuffer = buildMimeEmail({
        from,
        to,
        subject: subject || '(No Subject)',
        text,
        html,
        attachments: downloadedAttachments
      });
      console.log(`[${requestId}] MIME email built, size: ${rawBuffer.length}`);
    } else if (rawMessage) {
      // 原有模式：rawMessage 是 base64 编码的
      rawBuffer = Buffer.from(rawMessage, 'base64');
    } else {
      console.warn(`[${requestId}] Missing rawMessage or attachments`);
      return res.status(400).json({
        success: false,
        error: 'Missing rawMessage or attachments'
      });
    }

    console.log(`[${requestId}] Sending raw email...`);

    const params = {
      RawMessage: {
        Data: rawBuffer,
      },
      FromEmailAddress: from,
    };

    const command = new SendRawEmailCommand(params);
    const result = await sesClient.send(command);

    console.log(`[${requestId}] Email sent successfully. MessageId: ${result.MessageId}`);

    res.json({
      success: true,
      messageId: result.MessageId,
    });
  } catch (error) {
    console.error(`[${requestId}] Error sending raw email:`, error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * 构建 MIME 格式的邮件
 */
function buildMimeEmail({ from, to, subject, text, html, attachments }) {
  const boundary = `----=_NextPart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const toAddresses = Array.isArray(to) ? to.join(', ') : to;

  const parts = [];

  // 邮件头
  parts.push(`From: ${from}`);
  parts.push(`To: ${toAddresses}`);
  parts.push(`Subject: =?UTF-8?B?${Buffer.from(subject || '').toString('base64')}?=`);
  parts.push(`MIME-Version: 1.0`);
  parts.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  parts.push('');

  // multipart/alternative 部分
  const altBoundary = `----=_AltPart_${Date.now()}`;
  parts.push(`--${boundary}`);
  parts.push(`Content-Type: multipart/alternative; boundary="${altBoundary}"`);
  parts.push('');

  if (text || html) {
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
  }

  parts.push(`--${altBoundary}--`);
  parts.push('');

  // 附件部分
  if (attachments && attachments.length > 0) {
    for (const att of attachments) {
      const filename = att.filename || 'attachment';
      const contentType = att.contentType || 'application/octet-stream';
      const content = att.content;

      parts.push(`--${boundary}`);
      parts.push(`Content-Type: ${contentType}; name="${filename}"`);
      parts.push(`Content-Transfer-Encoding: base64`);
      parts.push(`Content-Disposition: attachment; filename="${filename}"`);
      if (att.contentId) {
        parts.push(`Content-ID: <${att.contentId}>`);
      }
      parts.push('');

      // 将内容转换为 base64，每行76字符
      const base64Content = content.toString('base64');
      const formattedBase64 = base64Content.match(/.{1,76}/g)?.join('\r\n') || base64Content;
      parts.push(formattedBase64);
      parts.push('');
    }
  }

  // 结束标记
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
