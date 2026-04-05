import http from '@/axios/index.js';

export function contactList(params) {
    return http.get('/contact/list', { params });
}

export function contactAdd(data) {
    return http.post('/contact/add', data);
}

export function contactUpdate(data) {
    return http.put('/contact/update', data);
}

export function contactDelete(contactId) {
    return http.delete('/contact/delete?contactId=' + contactId);
}

export function contactToggleStar(data) {
    return http.put('/contact/toggleStar', data);
}

export function contactGroupList() {
    return http.get('/contact/groupList');
}

export function contactGroupAdd(data) {
    return http.post('/contact/groupAdd', data);
}

export function contactGroupUpdate(data) {
    return http.put('/contact/groupUpdate', data);
}

export function contactGroupDelete(groupId) {
    return http.delete('/contact/groupDelete?groupId=' + groupId);
}
