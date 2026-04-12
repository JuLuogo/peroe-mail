import emailUtils from '../utils/email-utils';

export default function emailMsgTemplate(email, tgMsgTo, tgMsgFrom, tgMsgText, attachments, inlineImages) {

	let template = `<b>${email.subject}</b>`

		if (tgMsgFrom === 'only-name') {
			template += `

From\u200B：${email.name}`
		}

		if (tgMsgFrom === 'show') {
			template += `

From\u200B：${email.name}  &lt;${email.sendEmail}&gt;`
		}

		if(tgMsgTo === 'show' && tgMsgFrom === 'hide') {
			template += `

To：\u200B${email.toEmail}`

		} else if(tgMsgTo === 'show') {
		template += `
To：\u200B${email.toEmail}`
	}

	const text = (emailUtils.formatText(email.text) || emailUtils.htmlToText(email.content))
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');

	if(tgMsgText === 'show') {
		template += `

${text}`
	}

	// 如果有内嵌图片，显示图片数量（附件会在媒体组中显示，不需要单独列出）
	if (inlineImages && inlineImages.length > 0) {
		template += `

🖼️ + ${inlineImages.length}`;
	}

	// 如果有普通附件，显示附件数量（附件会在媒体组中显示，不需要单独列出）
	if (attachments && attachments.length > 0) {
		const attSizeList = attachments.map(att => {
			const size = att.size || 0;
			const sizeStr = size < 1024 ? `${size}B` : (size < 1024 * 1024 ? `${(size / 1024).toFixed(1)}KB` : `${(size / (1024 * 1024)).toFixed(1)}MB`);
			return `${att.filename} (${sizeStr})`;
		});
		template += `

📎 ${attachments.length} ${attSizeList.join(', ')}`;
	}

	return template;

}
