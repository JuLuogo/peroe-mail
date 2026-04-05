import http from '@/axios/index.js';

export function filterList() {
    return http.get('/filter/list');
}

export function filterAdd(data) {
    return http.post('/filter/add', data);
}

export function filterUpdate(data) {
    return http.put('/filter/update', data);
}

export function filterDelete(ruleId) {
    return http.delete('/filter/delete?ruleId=' + ruleId);
}

export function filterToggle(data) {
    return http.put('/filter/toggle', data);
}
