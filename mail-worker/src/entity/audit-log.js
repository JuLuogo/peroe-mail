import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const auditLog = sqliteTable('audit_log', {
	logId: integer('log_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	userEmail: text('user_email'),
	action: text('action').notNull(),
	targetType: text('target_type').notNull(),
	targetId: text('target_id'),
	targetDesc: text('target_desc'),
	detail: text('detail'),
	ip: text('ip'),
	userAgent: text('user_agent'),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull()
});

export const auditConst = {
	action: {
		USER_BAN: 'USER_BAN',
		USER_UNBAN: 'USER_UNBAN',
		USER_DELETE: 'USER_DELETE',
		USER_RESTORE: 'USER_RESTORE',
		USER_ADD: 'USER_ADD',
		USER_PWD_RESET: 'USER_PWD_RESET',
		EMAIL_DELETE: 'EMAIL_DELETE',
		EMAIL_BATCH_DELETE: 'EMAIL_BATCH_DELETE',
		SETTING_UPDATE: 'SETTING_UPDATE',
		ROLE_CREATE: 'ROLE_CREATE',
		ROLE_UPDATE: 'ROLE_UPDATE',
		ROLE_DELETE: 'ROLE_DELETE',
		REG_KEY_CREATE: 'REG_KEY_CREATE',
		REG_KEY_DELETE: 'REG_KEY_DELETE'
	},
	targetType: {
		USER: 'USER',
		EMAIL: 'EMAIL',
		SETTING: 'SETTING',
		ROLE: 'ROLE',
		REG_KEY: 'REG_KEY'
	}
};

export default auditLog
