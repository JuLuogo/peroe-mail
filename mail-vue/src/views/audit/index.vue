<template>
  <div class="audit-page">
    <div class="audit-header">
      <span class="title">{{ $t('auditLog') }}</span>
    </div>

    <div class="audit-filters">
      <el-select v-model="params.action" :placeholder="$t('actionType')" clearable>
        <el-option :label="$t('all')" value=""/>
        <el-option :label="$t('userBan')" value="USER_BAN"/>
        <el-option :label="$t('userUnban')" value="USER_UNBAN"/>
        <el-option :label="$t('userDelete')" value="USER_DELETE"/>
        <el-option :label="$t('userAdd')" value="USER_ADD"/>
        <el-option :label="$t('emailDelete')" value="EMAIL_DELETE"/>
        <el-option :label="$t('settingUpdate')" value="SETTING_UPDATE"/>
        <el-option :label="$t('roleCreate')" value="ROLE_CREATE"/>
        <el-option :label="$t('roleUpdate')" value="ROLE_UPDATE"/>
        <el-option :label="$t('roleDelete')" value="ROLE_DELETE"/>
      </el-select>
      <el-input
          v-model="params.userEmail"
          :placeholder="$t('searchByOperator')"
          clearable
          style="width: 200px"
      />
      <el-button type="primary" @click="search">{{ $t('search') }}</el-button>
    </div>

    <el-scrollbar class="audit-scrollbar">
      <el-table :data="logs" style="width: 100%" v-loading="loading">
        <el-table-column prop="createTime" :label="$t('time')" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="userEmail" :label="$t('operator')" width="180"/>
        <el-table-column prop="action" :label="$t('actionType')" width="150">
          <template #default="{ row }">
            {{ getActionLabel(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetType" :label="$t('targetType')" width="100">
          <template #default="{ row }">
            {{ getTargetTypeLabel(row.targetType) }}
          </template>
        </el-table-column>
        <el-table-column prop="targetDesc" :label="$t('target')"/>
        <el-table-column prop="ip" :label="$t('ip')" width="140"/>
        <el-table-column :label="$t('action')" width="80" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="viewDetail(row)">{{ $t('details') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="audit-pagination" v-if="total > 0">
        <el-pagination
            v-model:current-page="params.num"
            :page-size="params.size"
            :total="total"
            layout="prev, pager, next"
            @current-change="loadLogs"
        />
      </div>
    </el-scrollbar>

    <el-dialog v-model="showDetail" :title="$t('logDetail')">
      <el-descriptions :column="1" border v-if="currentLog">
        <el-descriptions-item :label="$t('time')">
          {{ formatTime(currentLog.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('operator')">
          {{ currentLog.userEmail }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('actionType')">
          {{ getActionLabel(currentLog.action) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('targetType')">
          {{ getTargetTypeLabel(currentLog.targetType) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('target')">
          {{ currentLog.targetDesc }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('ip')">
          {{ currentLog.ip }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('userAgent')">
          {{ currentLog.userAgent }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('detail')">
          <pre v-if="currentLog.detail" style="margin: 0; white-space: pre-wrap;">{{ formatDetail(currentLog.detail) }}</pre>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import {defineOptions, onMounted, reactive, ref} from "vue"
import {auditList, auditDetail} from "@/request/audit.js";
import {useI18n} from "vue-i18n";
import dayjs from "dayjs";

defineOptions({
  name: 'audit'
})

const {t} = useI18n()

const params = reactive({
  num: 1,
  size: 20,
  action: '',
  userEmail: ''
})

const logs = ref([])
const total = ref(0)
const loading = ref(false)
const showDetail = ref(false)
const currentLog = ref(null)

onMounted(() => {
  loadLogs()
})

async function loadLogs() {
  loading.value = true
  try {
    const data = await auditList(params)
    logs.value = data.list
    total.value = data.total
  } catch (e) {
    console.error('Failed to load audit logs:', e)
  } finally {
    loading.value = false
  }
}

function search() {
  params.num = 1
  loadLogs()
}

async function viewDetail(log) {
  try {
    currentLog.value = await auditDetail(log.logId)
    showDetail.value = true
  } catch (e) {
    console.error('Failed to load audit detail:', e)
  }
}

function formatTime(time) {
  if (!time) return '-'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

function formatDetail(detail) {
  try {
    return JSON.stringify(JSON.parse(detail), null, 2)
  } catch {
    return detail
  }
}

function getActionLabel(action) {
  const labels = {
    'USER_BAN': t('userBan'),
    'USER_UNBAN': t('userUnban'),
    'USER_DELETE': t('userDelete'),
    'USER_RESTORE': t('userRestore'),
    'USER_ADD': t('userAdd'),
    'USER_PWD_RESET': t('userPwdReset'),
    'EMAIL_DELETE': t('emailDelete'),
    'EMAIL_BATCH_DELETE': t('emailBatchDelete'),
    'SETTING_UPDATE': t('settingUpdate'),
    'ROLE_CREATE': t('roleCreate'),
    'ROLE_UPDATE': t('roleUpdate'),
    'ROLE_DELETE': t('roleDelete'),
    'REG_KEY_CREATE': t('regKeyCreate'),
    'REG_KEY_DELETE': t('regKeyDelete')
  }
  return labels[action] || action
}

function getTargetTypeLabel(type) {
  const labels = {
    'USER': t('user'),
    'EMAIL': t('email'),
    'SETTING': t('setting'),
    'ROLE': t('role'),
    'REG_KEY': t('regKey')
  }
  return labels[type] || type
}
</script>

<style lang="scss" scoped>
.audit-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.audit-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color);

  .title {
    font-weight: bold;
    font-size: 16px;
  }
}

.audit-filters {
  padding: 15px 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
}

.audit-scrollbar {
  flex: 1;
  overflow: hidden;
  padding: 15px 20px;
}

.audit-pagination {
  padding: 15px 0;
  display: flex;
  justify-content: center;
}
</style>
