import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const forwardRule = sqliteTable('forward_rule', {
	ruleId: integer('rule_id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id').notNull().default(0),
	pattern: text('pattern').notNull(),
	forwardTo: text('forward_to').notNull(),
	description: text('description').default(''),
	priority: integer('priority').default(0).notNull(),
	status: integer('status').default(1).notNull(),
	createTime: text('create_time').default(sql`CURRENT_TIMESTAMP`).notNull(),
	isDel: integer('is_del').default(0).notNull()
});

export const forwardRuleConst = {
	status: {
		DISABLE: 0,
		ENABLE: 1
	}
};

export default forwardRule;