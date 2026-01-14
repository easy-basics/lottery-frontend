<template>
  <div class="w-full bg-white rounded-t-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- 表格头部 -->
    <div class="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span class="text-white text-lg">🏆</span>
          </div>
          <div>
            <h2 class="text-white text-xl font-bold">中奖名单</h2>
            <p class="text-purple-200 text-sm">共 {{ winners.length }} 人中奖</p>
          </div>
        </div>
        
        <!-- 导出按钮 -->
        <button 
          @click="exportToExcel"
          class="flex items-center space-x-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span class="text-lg">📊</span>
          <span class="font-medium">导出Excel</span>
        </button>
      </div>
    </div>

    <!-- 表格容器 - 添加固定高度和滚动 -->
    <div class="relative overflow-hidden">
      <!-- 表格内容区域 -->
      <div class="overflow-auto max-h-96" ref="tableContainer">
        <table class="w-full min-w-full">
          <!-- 固定表头 -->
          <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span>#</span>
                  <span>序号</span>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span>👤</span>
                  <span>工号</span>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span>📝</span>
                  <span>姓名</span>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span>🏢</span>
                  <span>所属组织</span>
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                <div class="flex items-center space-x-2">
                  <span>🎯</span>
                  <span>中奖类型</span>
                </div>
              </th>
            </tr>
          </thead>
          
          <!-- 表格内容 -->
          <tbody class="bg-white divide-y divide-gray-200">
            <tr 
              v-for="(winner, index) in winners" 
              :key="winner.id"
              class="hover:bg-purple-50 transition-colors duration-150"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs font-bold">{{ index + 1 }}</span>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="font-mono bg-gray-100 px-2 py-1 rounded text-purple-600">{{ winner.ldap }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                {{ winner.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ winner.org }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ winner.prizeName }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- 空状态 -->
        <div v-if="winners.length === 0" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">📋</span>
          </div>
          <p class="text-gray-500 text-lg">暂无中奖记录</p>
          <p class="text-gray-400 text-sm mt-1">抽奖结束后将显示中奖名单</p>
        </div>
      </div>

      <!-- 滚动提示 -->
      <!-- <div v-if="winners.length > 10" class="absolute bottom-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full opacity-70">
        {{ winners.length }} 条记录
      </div> -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

// 定义 props
const props = defineProps({
  winners: {
    type: Array,
    default: () => []
  }
})

// 表格容器引用
const tableContainer = ref(null)

// 当前时间
const currentTime = ref('')

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  const date = new Date(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 导出到 Excel
const exportToExcel = () => {
  if (props.winners.length === 0) {
    alert('暂无数据可导出')
    return
  }

  try {
    // 准备导出数据
    const exportData = props.winners.map((winner, index) => ({
      序号: index + 1,
      工号: winner.ldap,
      姓名: winner.name,
      所属组织: winner.org,
      中奖类型: winner.prizeName
    }))

    // 创建工作簿
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(exportData)
    
    // 设置列宽
    const colWidths = [
      { wch: 8 },  // 序号
      { wch: 15 }, // 工号
      { wch: 10 }, // 姓名
      { wch: 20 }, // 所属组织
      { wch: 20 }  // 中奖时间
    ]
    worksheet['!cols'] = colWidths
    
    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '中奖名单')
    
    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    })
    
    // 保存文件
    const data = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    saveAs(data, `中奖名单_${new Date().toISOString().split('T')[0]}.xlsx`)
    
    console.log('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败，请重试')
  }
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
}

// 组件挂载时启动定时器
onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // 每分钟更新一次
})
</script>

<style scoped>
/* 自定义滚动条样式 */
.overflow-auto::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f8fafc;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #c4b5fd;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #8b5cf6;
}

/* 确保表头在滚动时固定 */
.sticky {
  position: sticky;
  top: 0;
  z-index: 10;
}

/* 表格内容区域样式 */
.max-h-96 {
  max-height: 24rem; /* 384px */
}

/* 平滑滚动 */
.overflow-auto {
  scroll-behavior: smooth;
}
</style>