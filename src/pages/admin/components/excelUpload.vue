<template>
  <div class="flex flex-col space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800">Excel数据上传</h3>
      <button 
        @click="downloadTemplate"
        class="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-1.5 rounded-md transition-all duration-200 shadow-sm hover:shadow active:scale-95 text-sm cursor-pointer"
      >
        <span class="text-sm">📥</span>
        <span class="font-medium">下载模板</span>
      </button>
    </div>
    
    <el-upload 
      class="upload-demo" 
      drag 
      accept=".xls,.xlsx" 
      :auto-upload="false" 
      :show-file-list="false" 
      :limit="1"
      :file-list="fileList" 
      :on-change="uploadChange" 
      :on-exceed="handleExceed"
    >
      <div class="el-upload__text">
        <div class="flex flex-col items-center justify-center p-4">
          <span class="text-2xl mb-2">📤</span>
          <span class="text-gray-600 text-sm">拖拽上传或 <em class="text-blue-500 font-medium">点击上传</em></span>
          <div class="mt-1 text-xs text-gray-500">
            {{ selectFileName ? selectFileName : '支持 .xlsx 和 .xls 格式' }}
          </div>
        </div>
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'

const emits = defineEmits(['uploadSuccess'])

const selectFileName = ref('')
// 添加fileList控制文件列表
const fileList = ref<any[]>([])

// 下载Excel模板
const downloadTemplate = () => {
  try {
    // 使用public文件夹中的模板文件
    const templatePath = '/lottery/幸运抽奖导入模板.xlsx'
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = templatePath
    link.download = '幸运抽奖导入模板.xlsx'
    link.style.display = 'none'
    
    // 添加到DOM并触发点击
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    ElMessage.success('模板下载成功！')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('下载模板失败，请重试')
  }
}

// 定义数据结构
interface SheetData {
  [sheetName: string]: any[]
}

// 封装Excel解析方法，接收File对象作为参数
const parseExcelFile = (file: any): Promise<SheetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        // 整理所有sheet数据
        const allSheetData: SheetData = {}
        let sheetKeys = ['lotteryInfo', 'lotteryPrize', 'lotteryUser']
        let sheetHeader = [['title', 'desc', 'status', 'type'], ['title', 'desc', 'prizeNum','isDeduplication'], ['ldap','name','org']]
        // 遍历所有工作表
        workbook.SheetNames.forEach((sheetName, index) => {
          // 获取当前工作表
          const worksheet = workbook.Sheets[sheetName]
          // 将工作表转换为JSON数组（以行为单位）
          const sheetJSON = XLSX.utils.sheet_to_json(worksheet, {
            header: sheetHeader[index],
          })
          // 存储当前sheet的数据
          allSheetData[sheetKeys[index]] = sheetJSON.slice(1)
        })
        emits('uploadSuccess', allSheetData)
        resolve(allSheetData)
      } catch (error) {
        console.error('解析Excel文件失败:', error)
        ElMessage.error('解析Excel文件失败，请检查文件格式')
        reject(error)
      }
    }

    // 处理文件读取错误
    reader.onerror = (error) => {
      console.error('文件读取错误:', error)
      ElMessage.error('文件读取错误，请重试')
      reject(error)
    }
    reader.readAsBinaryString(file.raw || file)
  })
}

const uploadChange = (file: any, files: any[]) => {
  // 更新文件名显示
  selectFileName.value = file.name

  // 更新文件列表，始终只保留最新选择的文件
  fileList.value = [file]

  // 调用封装的解析方法
  parseExcelFile(file)
}

// 处理超出限制的情况（虽然设置了limit=1，但最好添加这个处理）
const handleExceed = (files: any[], filesList: any[]) => {
  // 只保留最新选择的文件
  const newFile = files[0]
  fileList.value = [newFile]
  selectFileName.value = newFile.name

  // 调用封装的解析方法
  parseExcelFile(newFile)
}
</script>

<style scoped>
/* 自定义上传区域样式 */
.upload-demo :deep(.el-upload-dragger) {
  @apply border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors duration-200;
  @apply w-full h-32 flex items-center justify-center;
}

.upload-demo :deep(.el-upload-dragger:hover) {
  @apply bg-blue-50;
}

.upload-demo :deep(.el-upload-dragger .el-upload__text) {
  @apply w-full;
}
</style>