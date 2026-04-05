<template>
  <div class="filter-page">
    <div class="filter-header">
      <span class="title">{{ $t('filterRules') }}</span>
      <el-button type="primary" @click="openAdd">
        <Icon icon="ion:add-outline" width="18" height="18"/>
        {{ $t('add') }}
      </el-button>
    </div>

    <el-scrollbar class="filter-scrollbar">
      <el-table :data="rules" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" :label="$t('ruleName')" width="150"/>
        <el-table-column prop="field" :label="$t('matchField')" width="120">
          <template #default="{ row }">
            {{ getFieldLabel(row.field) }}
          </template>
        </el-table-column>
        <el-table-column prop="operator" :label="$t('operator')" width="120">
          <template #default="{ row }">
            {{ getOperatorLabel(row.operator) }}
          </template>
        </el-table-column>
        <el-table-column prop="value" :label="$t('matchValue')"/>
        <el-table-column prop="action" :label="$t('action')" width="120">
          <template #default="{ row }">
            {{ getActionLabel(row.action) }}
          </template>
        </el-table-column>
        <el-table-column prop="priority" :label="$t('priority')" width="80"/>
        <el-table-column prop="status" :label="$t('status')" width="100">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="toggleRule(row)"
            />
          </template>
        </el-table-column>
        <el-table-column :label="$t('action')" width="120" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">{{ $t('change') }}</el-button>
            <el-button size="small" type="danger" @click="deleteRule(row)">{{ $t('delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="rules.length === 0 && !loading" :description="$t('noFilterRules')"/>
    </el-scrollbar>

    <el-dialog v-model="showDialog" :title="isEdit ? $t('editRule') : $t('addRule')">
      <el-form :model="form" label-width="100px">
        <el-form-item :label="$t('ruleName')">
          <el-input v-model="form.name"/>
        </el-form-item>
        <el-form-item :label="$t('matchField')">
          <el-select v-model="form.field" :placeholder="$t('selectMatchField')">
            <el-option :label="$t('subject')" value="subject"/>
            <el-option :label="$t('sender')" value="sendEmail"/>
            <el-option :label="$t('recipient')" value="toEmail"/>
            <el-option :label="$t('content')" value="content"/>
            <el-option :label="$t('senderName')" value="name"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('operator')">
          <el-select v-model="form.operator" :placeholder="$t('selectOperator')">
            <el-option :label="$t('contains')" value="contains"/>
            <el-option :label="$t('equals')" value="equals"/>
            <el-option :label="$t('startsWith')" value="startsWith"/>
            <el-option :label="$t('endsWith')" value="endsWith"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('matchValue')">
          <el-input v-model="form.value" :placeholder="$t('enterMatchValue')"/>
        </el-form-item>
        <el-form-item :label="$t('action')">
          <el-select v-model="form.action" :placeholder="$t('selectAction')">
            <el-option :label="$t('markRead')" :value="0"/>
            <el-option :label="$t('markStar')" :value="1"/>
            <el-option :label="$t('reject')" :value="3"/>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('priority')">
          <el-input-number v-model="form.priority" :min="0" :max="100"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">{{ $t('cancel') }}</el-button>
        <el-button type="primary" @click="submit" :loading="submitLoading">{{ $t('save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {defineOptions, onMounted, reactive, ref} from "vue"
import {filterList, filterAdd, filterUpdate, filterDelete, filterToggle} from "@/request/filter.js";
import {useI18n} from "vue-i18n";
import {ElMessage, ElMessageBox} from "element-plus";
import {Icon} from "@iconify/vue";

defineOptions({
  name: 'filter'
})

const {t} = useI18n()

const rules = ref([])
const loading = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)

const form = reactive({
  ruleId: null,
  name: '',
  field: 'subject',
  operator: 'contains',
  value: '',
  action: 0,
  priority: 0,
  status: 1
})

onMounted(() => {
  loadRules()
})

async function loadRules() {
  loading.value = true
  try {
    rules.value = await filterList()
  } catch (e) {
    console.error('Failed to load filter rules:', e)
  } finally {
    loading.value = false
  }
}

function openAdd() {
  isEdit.value = false
  form.ruleId = null
  form.name = ''
  form.field = 'subject'
  form.operator = 'contains'
  form.value = ''
  form.action = 0
  form.priority = 0
  form.status = 1
  showDialog.value = true
}

function openEdit(rule) {
  isEdit.value = true
  Object.assign(form, rule)
  showDialog.value = true
}

async function submit() {
  if (!form.name || !form.value) {
    ElMessage.warning(t('pleaseFillRequiredFields'))
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await filterUpdate(form)
    } else {
      await filterAdd(form)
    }
    showDialog.value = false
    ElMessage.success(t('saveSuccessMsg'))
    loadRules()
  } catch (e) {
    console.error('Failed to save filter rule:', e)
  } finally {
    submitLoading.value = false
  }
}

async function deleteRule(rule) {
  try {
    await ElMessageBox.confirm(
        t('deleteConfirm'),
        t('warning'),
        { type: 'warning' }
    )
    await filterDelete(rule.ruleId)
    ElMessage.success(t('delSuccessMsg'))
    loadRules()
  } catch (e) {
    if (e !== 'cancel') {
      console.error('Failed to delete filter rule:', e)
    }
  }
}

async function toggleRule(rule) {
  try {
    await filterToggle({ ruleId: rule.ruleId, status: rule.status })
  } catch (e) {
    console.error('Failed to toggle filter rule:', e)
    rule.status = rule.status ? 0 : 1
  }
}

function getFieldLabel(field) {
  const labels = {
    'subject': t('subject'),
    'sendEmail': t('sender'),
    'toEmail': t('recipient'),
    'content': t('content'),
    'name': t('senderName')
  }
  return labels[field] || field
}

function getOperatorLabel(operator) {
  const labels = {
    'contains': t('contains'),
    'equals': t('equals'),
    'startsWith': t('startsWith'),
    'endsWith': t('endsWith')
  }
  return labels[operator] || operator
}

function getActionLabel(action) {
  const labels = {
    0: t('markRead'),
    1: t('markStar'),
    2: t('moveTo'),
    3: t('reject')
  }
  return labels[action] || action
}
</script>

<style lang="scss" scoped>
.filter-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
}

.filter-header {
  padding: 15px 20px;
  border-bottom: 1px solid var(--el-border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .title {
    font-weight: bold;
    font-size: 16px;
  }
}

.filter-scrollbar {
  flex: 1;
  overflow: hidden;
  padding: 15px 20px;
}
</style>
