import http from '@/axios/index.js';

export function auditList(params) {
    return http.get('/audit/list', { params });
}

export function auditDetail(logId) {
    return http.get('/audit/detail', { params: { logId } });
}
