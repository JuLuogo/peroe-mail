import http from '@/axios/index.js';

export function twoFactorSetup() {
    return http.get('/2fa/setup');
}

export function twoFactorEnable(data) {
    return http.post('/2fa/enable', data);
}

export function twoFactorDisable(data) {
    return http.post('/2fa/disable', data);
}

export function twoFactorVerify(data) {
    return http.post('/2fa/verify', data);
}

export function twoFactorStatus() {
    return http.get('/2fa/status');
}
