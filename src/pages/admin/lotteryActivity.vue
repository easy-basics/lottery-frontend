<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import dialogActicity from './components/dialogActicity.vue'
import { queryLottery, deleteLottery, updateLottery } from '@/utils/indexedDB'
const route = useRoute()
const router = useRouter()

const dialogVisible = ref(false)
const tableData = ref([])
const dialogActicityRef = ref()

onMounted(async () => {
  await getTableData()
})
const handleAdd = (row: any) => {
  dialogVisible.value = true
  dialogActicityRef.value.handAdd()
}

const getTableData = async () => {
  await queryLottery({
  }).then((res) => {
    if (res.success) {
      tableData.value = res.data.reverse()
    }
  }).catch((err) => {
    console.log(err)
  })
}

// 预览抽奖
const handlePreView = (row: any) => {
  dialogVisible.value = true
  dialogActicityRef.value.previewLottery(row.key)
}
const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    '删除后将无法恢复，确定删除抽奖活动吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteLottery({ key: row.key }).then((res) => {
        if (res.success) {
          ElMessage({
            type: 'success',
            message: '操作成功',
          })
          getTableData()
        }
      })
    }).catch(() => {
      // ElMessage({
      //   type: 'info',
      //   message: '删除操作已取消',
      // })
    })
}
const changeStatus = (row: any) => {
  console.log('row:', row)
  updateLottery({ key: row.key, status: row.status }).then((res) => {
    if (res.success) {
      ElMessage({
        type: 'success',
        message: '操作成功',
      })
    }
  })
}

// 前往抽奖
const goLottery = (row: any) => {
  router.push({
    path: '/',
    query: {
      lotteryKey: row.key
    }
  })
}
</script>

<template>
  <div class="w-full h-full">
    <!-- 头部区域 -->
      <div class="flex justify-end items-center mb-4">
        <el-button  type="primary" @click="handleAdd" 
          class="btn-add h-10 px-6 bg-gradient-to-r from-purple-600 to-violet-600 border-0 hover:from-purple-500 hover:to-violet-500 transition-all duration-300 shadow-lg">
          
          新增活动
        </el-button>
      </div>

    <!-- 表格区域 -->
    <div class="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
      <el-table :data="tableData" stripe border class="purple-theme-table"
        :header-cell-class-name="() => 'purple-header'">
        <el-table-column prop="title" label="抽奖活动名称" width="180" align="center" />
        <el-table-column prop="desc" label="描述" min-width="200" />
        <el-table-column prop="state" label="奖项数" width="120" align="center">
          <template #default="{ row }">
            <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              {{ row.lotteryPrize.length }}项
            </span>
          </template>
        </el-table-column>
        <el-table-column label="参与人数" width="120" align="center">
          <template #default="{ row }">
            <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {{ row.lotteryUser.length }}人
            </span>
          </template>
        </el-table-column>
        <el-table-column label="中奖人数" width="120" align="center">
          <template #default="{ row }">
            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {{ row.lotteryPrize.reduce((acc, cur) => acc + cur?.prizeUserList?.length || 0, 0) }}人
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="抽奖类型" width="120" align="center" />
        <el-table-column prop="status" label="活动状态" width="140" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" @change="changeStatus(row)" inline-prompt active-text="开启"
              inactive-text="关闭" class="purple-switch" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="flex justify-center space-x-2">
              <el-button link type="primary" size="small" @click="handlePreView(row)"
                class="hover:text-purple-600 transition-colors">
                <i class="i-mdi-eye-outline mr-1"></i>
                详情
              </el-button>
              <el-button link type="success" size="small" @click="goLottery(row)"
                class="hover:text-green-600 transition-colors">
                <i class="i-mdi-gift-outline mr-1"></i>
                抽奖
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)"
                class="hover:text-red-600 transition-colors">
                <i class="i-mdi-delete-outline mr-1"></i>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 弹窗组件 -->
    <dialogActicity ref="dialogActicityRef" v-model:dialogVisible="dialogVisible" @saveSuccess="getTableData" />
  </div>
</template>

<style scoped>
/* 自定义紫色主题样式 */
:deep(.purple-theme-table .el-table) {
  --el-table-border-color: rgba(139, 92, 246, 0.1);
  --el-table-header-bg-color: rgba(139, 92, 246, 0.05);
}

:deep(.purple-header) {
  background: #f4effe !important;
  /* background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%) !important; */
  color: #6d28d9 !important;
  font-weight: 600;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2) !important;
}

:deep(.purple-theme-table .el-table__row:hover td) {
  background-color: rgba(139, 92, 246, 0.03) !important;
}

:deep(.purple-theme-table .el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(139, 92, 246, 0.02) !important;
}

:deep(.purple-switch .el-switch__core) {
  --el-switch-on-color: #8b5cf6;
  --el-switch-off-color: #dcdfe6;
}

:deep(.purple-switch .el-switch__action) {
  background: linear-gradient(135deg, #8b5cf6, #a855f7);
}

/* 按钮悬停效果 */
:deep(.el-button--primary) {
  --el-button-bg-color: linear-gradient(135deg, #8b5cf6, #a855f7);
  --el-button-border-color: transparent;
  --el-button-hover-bg-color: linear-gradient(135deg, #7c3aed, #9333ea);
  --el-button-hover-border-color: transparent;
}

:deep(.el-button--success) {
  --el-button-bg-color: linear-gradient(135deg, #10b981, #34d399);
  --el-button-border-color: transparent;
}

:deep(.el-button--danger) {
  --el-button-bg-color: linear-gradient(135deg, #ef4444, #f87171);
  --el-button-border-color: transparent;
}

/* 链接按钮样式 */
:deep(.el-button--link) {
  --el-button-text-color: #6b7280;
  --el-button-hover-text-color: #8b5cf6;
}

:deep(.el-button--link.el-button--primary) {
  --el-button-text-color: #8b5cf6;
  --el-button-hover-text-color: #7c3aed;
}

:deep(.el-button--link.el-button--success) {
  --el-button-text-color: #10b981;
  --el-button-hover-text-color: #059669;
}

:deep(.el-button--link.el-button--danger) {
  --el-button-text-color: #ef4444;
  --el-button-hover-text-color: #dc2626;
}

/* 弹窗紫色主题 */
:deep(.el-dialog) {
  --el-dialog-bg-color: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%);
  --el-dialog-box-shadow: 0 25px 50px rgba(139, 92, 246, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

:deep(.el-dialog__title) {
  color: #6d28d9;
  font-weight: 600;
}
</style>