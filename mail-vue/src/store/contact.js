import { defineStore } from 'pinia';
import { contactGroupList } from '@/request/contact.js';

export const useContactStore = defineStore('contact', {
    state: () => ({
        groups: [],
        refreshGroup: 0,
    }),
    actions: {
        async loadGroups() {
            try {
                this.groups = await contactGroupList();
            } catch (e) {
                console.error('Failed to load contact groups:', e);
            }
        },
        refreshGroups() {
            this.refreshGroup++;
            this.loadGroups();
        }
    }
});
