<template>
  <!-- <el-button plain @click="dialogVisible = true">
    Click to open the Dialog
  </el-button> -->

  <el-dialog class="dialog-activity-wrap" :model-value="dialogVisible"  width="800" :show-close="false" :close-on-click-modal="false" :close-on-press-escape="false">
    <!-- <template #header>
      <div class="dialog-header">
        <span>编辑活动</span>
      </div>
    </template> -->
    <div class="dialog-main">
      <excelUpload @uploadSuccess="handleUploadSuccess" v-if="showUpdate" />
      <el-tabs v-model="activeName" class="demo-tabs"  v-if="formData.isValue">
        <el-tab-pane label="抽奖信息" name="first">
          <el-form :model="formData.lotteryInfo" ref="formRef" label-width="80px" disabled >
            <el-form-item label="活动名称" prop="title">
              <el-input v-model="formData.lotteryInfo.title" placeholder="请输入活动名称" />
            </el-form-item>
            <el-form-item label="活动描述" prop="desc">
              <el-input v-model="formData.lotteryInfo.desc" placeholder="请输入活动描述" />
            </el-form-item>
            <el-form-item label="活动状态" prop="status">
              <el-switch v-model="formData.lotteryInfo.status" inline-prompt active-text="开启" inactive-text="关闭" />
            </el-form-item>
            <el-form-item label="活动类型" prop="type">
              <el-input v-model="formData.lotteryInfo.type" placeholder="请输入活动类型" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane :label="`奖品设置(${formData.lotteryPrize.length})`" name="second">
          <el-table class="active-table" :data="formData.lotteryPrize" style="width: 100%">
            <el-table-column prop="title" label="奖品名称" width="180" />
            <el-table-column prop="desc" label="奖品描述"  />
            <el-table-column prop="prizeNum" label="奖品数量" width="80" align="center" />
            <el-table-column prop="isDeduplication" label="可重复中奖" width="100" align="center">
              <template #default="scope">
              <el-switch v-model="scope.row.isDeduplication" inline-prompt active-text="是"
                  inactive-text="否" disabled />
              </template>
            </el-table-column>
          </el-table>

        </el-tab-pane>
        <el-tab-pane :label="`人员设置(${formData.lotteryUser.length})`" name="third">
          <el-table-v2 class="active-table-v2" :columns="columnslotteryUser" :data="formData.lotteryUser" :width="700" :height="400"  />
        </el-tab-pane>

        <el-tab-pane :label="`中奖人员(${formData.PrizeUser.length})`" name="fourth">
          <WinnerTable :winners="formData.PrizeUser" />
          <!-- <el-table-v2 class="active-table-v2" :columns="columnslotteryUser" :data="formData.PrizeUser" :width="700"
            :height="400" /> -->
        </el-tab-pane>
      </el-tabs>
    </div>
   
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleDialogClose(false)">关闭</el-button>
        <el-button type="primary" @click="saveLottery" v-if="formData.isValue && showUpdate">
          保存
        </el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import excelUpload from './excelUpload.vue'
import { addLottery, queryLottery } from '@/utils/indexedDB'
import { cloneDeep } from 'lodash-es'
import { deduplicateUsersOptimized, getPrizeUserList } from '@/utils/index'
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false,
  },
})

const formDataTemplate = {
  lotteryInfo: {},
  lotteryPrize: [],
  lotteryUser: [],
  PrizeUser: [],
  isValue: false,
}
// 3. 定义emit事件
const emits = defineEmits(['update:dialogVisible', 'saveSuccess'])

const handleDialogClose = (value: boolean = false) => {
  emits('update:dialogVisible', value)
}

const activeName = ref('first')
const showUpdate = ref(false)
const formData = reactive(cloneDeep(formDataTemplate))
const columnslotteryUser = [
  { key: 'ldap', dataKey: 'ldap', title: 'LDAP', width: 120 },
  { key: 'name', dataKey: 'name', title: '姓名', width: 120 },
  { key: 'org', dataKey: 'org', title: '组织',width: 200 },
]
const handleUploadSuccess = (data: any) => {
  formData.lotteryInfo = data.lotteryInfo[0]
  formData.lotteryInfo.status = data.lotteryInfo[0].status === '关闭' ? false: true
  formData.lotteryPrize = data.lotteryPrize.map((item) => ({
    ...item,
    isOver: false, // 当前抽奖是否结束
    prizeUserList: [], //当前奖项抽中的用户
    isDeduplication: item.isDeduplication === '是' ? true: false, //当前奖项是否可重复中奖
  }))
  if (data.lotteryUser.length > 0) {
    console.log('data.lotteryUser:', data.lotteryUser.length)
    const { uniqueUsers, duplicates, duplicateCount } = deduplicateUsersOptimized(data.lotteryUser)
    formData.lotteryUser = uniqueUsers
    if (duplicateCount > 0) {
      ElMessageBox.alert(`已经帮您过滤掉${duplicateCount}个重复用户`, '人员重复提示', {
        confirmButtonText: '确定',
      })
    }

  }
  formData.isValue = true
  activeName.value = 'first'
}
// 保存抽奖
const saveLottery = async () => {
  let saveData = {
    ...formData.lotteryInfo,
    lotteryPrize: formData.lotteryPrize,
    lotteryUser: formData.lotteryUser,
    PrizeUser: formData.PrizeUser,
  }
  addLottery(saveData).then(() => {
    emits('saveSuccess')
    handleDialogClose(false)
    ElMessage.success('保存成功')
  }).catch((err) => {
    console.log('err:', err)
  })
}

const addPrizeUser = (row) => {
  formData.PrizeUser.push({
    ...row,
    isOver: false // 当前奖品是否抽奖过
  })
}


const previewLottery = async (key) => {
  showUpdate.value = false
  console.log('key:', key)
  queryLottery({key}).then((res) => {
    // console.log('res:', res)

    if (res.success) {
      let row = res.data[0]
      formData.lotteryInfo = {
        title: row.title,
        desc: row.desc,
        status: row.status,
        type: row.type,
      }
      formData.lotteryPrize = row.lotteryPrize
      formData.lotteryUser = row.lotteryUser
      formData.PrizeUser = row.PrizeUser
      formData.isValue = true
      activeName.value = 'first'
      formData.PrizeUser = getPrizeUserList(row.lotteryPrize)


    }
  })
  
}

// const getPrizeUserList = (lotteryPrize) => {
//   const PrizeUser = []
//   lotteryPrize.map(i => {
//     i.prizeUserList.map(s => {
//       PrizeUser.push({
//         ldap: s.ldap,
//         name: s.name,
//         org: s.org,
//         prizeName: i.title
//       })
//     })
//   })
//   formData.PrizeUser = PrizeUser
// }


// const previewLottery = async (row) => {
//   showUpdate.value = false
//   formData.lotteryInfo = {
//     title: row.title,
//     desc: row.desc,
//     status: row.status,
//     type: row.type,
//   }
//   formData.lotteryPrize = row.lotteryPrize
//   formData.lotteryUser = row.lotteryUser
//   formData.PrizeUser = row.PrizeUser
//   formData.isValue = true
//   activeName.value = 'first'
// }

const handAdd = () => {
  showUpdate.value = true
  resetFormData()
}

const resetFormData = () => {
  let newFormData = cloneDeep(formDataTemplate)
  Object.keys(newFormData).forEach(key => {
    formData[key] = newFormData[key]
  })
}



// 暴露方法给父组件
defineExpose({
  previewLottery,
  handAdd
})
</script>
<style scoped lang="scss">
.dialog-activity-wrap {
  padding: 0px !important;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: #303133;
    border-bottom: 1px solid var(--ep-border-color);
    padding: 10px 16px;
  }
  .dialog-main{
    padding: 10px 16px;
    text-align: left;
  }
  .dialog-footer{
    padding: 10px 16px;
    display: flex;
    justify-content: center;
    border-top: 1px solid var(--ep-border-color);
  }
}
</style>
<style lang="scss">
.dialog-activity-wrap {
  padding: 0px !important;
}
</style>
