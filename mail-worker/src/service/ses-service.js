import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import settingService from './setting-service.js';

const sesService = {

    async sendEmail(c, params) {
        const { from, to, subject, text, html, attachments } = params;

        const { sesAccessKey, sesSecretKey, sesRegion, sesTokens } = await settingService.query(c);

        const domain = from.split('@')[1];
        let accessKey = sesAccessKey;
        let secretKey = sesSecretKey;

        // 如果有按域名配置的 SES 令牌，则使用对应的配置
        if (sesTokens[domain]) {
            const domainConfig = JSON.parse(sesTokens[domain]);
            accessKey = domainConfig.accessKey || accessKey;
            secretKey = domainConfig.secretKey || secretKey;
        }

        const client = new SESv2Client({
            region: sesRegion,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey
            }
        });

        const sendEmailCommand = new SendEmailCommand({
            FromEmailAddress: from,
            Destination: {
                ToAddresses: to
            },
            Content: {
                Simple: {
                    Subject: {
                        Data: subject,
                        Charset: 'UTF-8'
                    },
                    Body: {}
                }
            }
        });

        if (text) {
            sendEmailCommand.input.Content.Simple.Body.Text = {
                Data: text,
                Charset: 'UTF-8'
            };
        }

        if (html) {
            sendEmailCommand.input.Content.Simple.Body.Html = {
                Data: html,
                Charset: 'UTF-8'
            };
        }

        const response = await client.send(sendEmailCommand);

        return {
            id: response.MessageId,
            data: response
        };
    }
};

export default sesService;