import http from '@/axios/index.js';

export function settingSet(setting) {
    return http.put('/setting/set',setting)
}

export function settingQuery() {
    return http.get('/setting/query')
}

export function websiteConfig() {
    return http.get('/setting/websiteConfig')
}

export function setBackground(background) {
    return http.put('/setting/setBackground',{background})
}

export function deleteBackground() {
    return http.delete('/setting/deleteBackground')
}

export function cleanupTempFiles(types, days) {
    return http.post('/setting/cleanupTempFiles', { types, days })
}

export function tempFileStats() {
    return http.get('/setting/tempFileStats')
}

export function previewCleanup(days) {
    return http.post('/setting/previewCleanup', { days })
}

export function cleanupRules() {
    return http.post('/setting/cleanupRules')
}

export function ruleStats() {
    return http.get('/setting/ruleStats')
}
