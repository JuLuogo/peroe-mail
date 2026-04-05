import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const contact = sqliteTable('contact', {
	contactId: integer('contact_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	email: text('email').notNull(),
	name: text('name').notNull(),
	company: text('company'),
	phone: text('phone'),
	description: text('description'),
	groupId: integer('group_id'),
	isStar: integer('is_star').default(0).notNull(),
	sendCount: integer('send_count').default(0).notNull(),
	lastSendTime: text('last_send_time'),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
	updateTime: text('update_time'),
	isDel: integer('is_del').default(0).notNull()
});

export const contactGroup = sqliteTable('contact_group', {
	groupId: integer('group_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	name: text('name').notNull(),
	color: text('color').default('#1890ff'),
	sort: integer('sort').default(0).notNull(),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
	isDel: integer('is_del').default(0).notNull()
});

export default contact
