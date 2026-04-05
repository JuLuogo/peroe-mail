import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const filterRule = sqliteTable('filter_rule', {
	ruleId: integer('rule_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull(),
	name: text('name').notNull(),
	field: text('field').notNull(),
	operator: text('operator').notNull(),
	value: text('value').notNull(),
	action: integer('action').notNull(),
	actionTarget: text('action_target'),
	priority: integer('priority').default(0).notNull(),
	status: integer('status').default(1).notNull(),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
	isDel: integer('is_del').default(0).notNull()
});

export const filterConst = {
	field: {
		SUBJECT: 'subject',
		FROM: 'sendEmail',
		TO: 'toEmail',
		CONTENT: 'content',
		NAME: 'name'
	},
	operator: {
		CONTAINS: 'contains',
		EQUALS: 'equals',
		STARTS_WITH: 'startsWith',
		ENDS_WITH: 'endsWith'
	},
	action: {
		MARK_READ: 0,
		MARK_STAR: 1,
		MOVE_TO: 2,
		REJECT: 3
	}
};

export default filterRule
