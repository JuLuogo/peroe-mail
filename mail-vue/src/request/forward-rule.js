import http from '@/axios/index.js';

export function forwardRuleList() {
	return http.get('/forward-rule/list');
}

export function forwardRuleAdd(data) {
	return http.post('/forward-rule/add', data);
}

export function forwardRuleUpdate(data) {
	return http.put('/forward-rule/update', data);
}

export function forwardRuleDelete(ruleId) {
	return http.delete('/forward-rule/delete?ruleId=' + ruleId);
}

export function forwardRuleToggle(data) {
	return http.put('/forward-rule/toggle', data);
}