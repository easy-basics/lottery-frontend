<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 flex flex-col">
    <!-- 头部区域 -->
    <header class="relative overflow-hidden bg-gradient-to-r from-purple-600/20 via-violet-600/20 to-pink-600/20 backdrop-blur-lg">
      <!-- 背景装饰 -->
      <div class="absolute inset-0">
        <div class="absolute top-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full -translate-x-32 -translate-y-32">
        </div>
        <div class="absolute bottom-0 right-0 w-96 h-96 bg-violet-400/10 rounded-full translate-x-48 translate-y-48">
        </div>
        <div class="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400/5 rounded-full -translate-x-1/2 -translate-y-1/2">
        </div>
      </div>

      <div class="relative z-10 container mx-auto px-6 py-16 text-center">
        <!-- 主标题 -->
        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-violet-200 to-pink-200 mb-4 tracking-tighter">
          {{ lotteryInfo.title || '幸运大抽奖' }}
        </h1>

        <!-- 副标题 -->
        <p class="text-xl md:text-2xl lg:text-3xl text-purple-100 font-medium mb-6 opacity-90">
          {{ lotteryInfo.desc || '年度盛典 · 惊喜不断 · 好运连连' }}
        </p>

        <!-- 装饰线条 -->
        <div
          class="w-48 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto rounded-full opacity-60">
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="relative z-10 py-12 px-6 flex-1">
      <div class="container mx-auto max-w-7xl">
        <!-- 统计信息区域 -->
        <div class="mb-12 text-center">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">活动实时统计</h2>
          <p class="text-purple-200 text-lg md:text-xl">最新数据更新于: {{ updateData }}</p>
        </div>

        <!-- 统计卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <!-- 参与人数卡片 -->
          <div
            class="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105">
            <div class="flex items-center justify-center w-16 h-16 bg-purple-500/20 rounded-full mb-4 mx-auto">
              <span class="text-2xl text-purple-300">👥</span>
            </div>
            <h3 class="text-lg font-semibold text-white text-center mb-2">参与人数</h3>
            <p class="text-3xl md:text-4xl font-bold text-purple-300 text-center mb-2">{{ lotteryInfo.lotteryUserTotal }}</p>
            <div class="flex items-center justify-center text-sm text-purple-200">
              <span class="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              <span>已中奖 {{ prizesCount.prizesUserCount || 0 }} 人</span>
            </div>
          </div>

          <!-- 中奖人数卡片 -->
          <div
            class="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105">
            <div class="flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4 mx-auto">
              <span class="text-2xl text-green-300">🎁</span>
            </div>
            <h3 class="text-lg font-semibold text-white text-center mb-2">奖品数量</h3>
            <p class="text-3xl md:text-4xl font-bold text-green-300 text-center mb-2">{{ prizesCount.count }}</p>
            <div class="text-sm text-purple-200 text-center">
              <span>中奖率: {{ prizesCount.percentage }} %</span>
            </div>
          </div>

          <!-- 活动状态卡片 -->
          <div
            class="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105">
            <div class="flex items-center justify-center w-16 h-16 bg-orange-500/20 rounded-full mb-4 mx-auto">
              <span class="text-2xl text-orange-300">⏰</span>
            </div>
            <h3 class="text-lg font-semibold text-white text-center mb-2">活动进度</h3>
            <div class="flex items-center justify-center mb-2">
              <template v-if="prizesCount.barWidth == 100">
                <span class="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                <span class="text-lg font-semibold text-red-400">已结束</span>
              </template>
              <template v-else>
                <span class="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span class="text-lg font-semibold text-green-300">进行中</span>
              </template>
            </div>
            <div class="text-sm text-purple-200 text-center">
              <div>当前进度 {{ prizesCount.barWidth + ' %' }}</div>
              <div class="mt-2 bg-purple-400/20 rounded-full h-2 w-full">
                <div class="bg-green-400 h-2 rounded-full  transition-all duration-1000 " :style='{ width: `${prizesCount.barWidth}%`}'></div>
              </div>
            </div>
          </div>

          <!-- 奖品总数卡片 -->
          <div
            class="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-500 hover:scale-105">
            <div class="flex items-center justify-center w-16 h-16 bg-pink-500/20 rounded-full mb-4 mx-auto">
              <span class="text-2xl text-pink-300">🏆</span>
            </div>
            <h3 class="text-lg font-semibold text-white text-center mb-2">中奖用户</h3>
            <p class="text-3xl md:text-4xl font-bold text-pink-300 text-center mb-2 cursor-pointer" @click="handleClickPrizeUser" >{{ prizesCount.prizesUserCount }}</p>
            <div class="text-sm text-purple-200 text-center">
              <span>{{ prizesCount.isOverCount }}个奖项类别</span>
            </div>
          </div>
        </div>
        <PrizeCard :prizes="lotteryInfo.lotteryPrize" :status="lotteryInfo.status" />
      </div>
    </main>

   <FooterRight/>

    <!-- 背景粒子效果 -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="particles"></div>
    </div>
  </div>
  <el-dialog v-model="WinnerTableShow" :show-close="false"  width="800" center>
    <WinnerTable :winners="lotteryInfo.prizeUserList" />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="WinnerTableShow = false">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryLottery } from '@/utils/indexedDB'
import dayjs from 'dayjs'
import { getPrizeUserList } from '@/utils/index'

const route = useRoute()
const router = useRouter()

let lotteryUserSave = []
const updateData = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const WinnerTableShow = ref(false)
const lotteryInfo = reactive({
  title: '',
  desc: '',
  key: '',
  status: true,
  lotteryPrize: [],
  prizeUserList: [],
  lotteryUserTotal:0
})

const handleClickPrizeUser = () => {
  // lotteryInfo.prizeUserList = getPrizeUserList(lotteryInfo.lotteryPrize)
  // lotteryInfo.prizeUserList = prizeUserList
  // console.log('lotteryInfo.prizeUserList:', lotteryInfo.prizeUserList)
  WinnerTableShow.value = true

}

// 计算总奖品数量
const totalPrizes = computed(() => {
  return prizes.value.reduce((total, prize) => total + prize.count, 0)
})

// 计算总奖品数量
const prizesCount = computed(() => {
  let count = lotteryInfo.lotteryPrize.reduce((total, prize) => total + prize.prizeNum, 0) || 0
  let percentage = (count / lotteryInfo.lotteryUserTotal * 100).toFixed(2) || 0
  let isOverCount = lotteryInfo.lotteryPrize.reduce((total, prize) => total + (prize.isOver ? 1 : 0), 0) || 0
  // let prizesUserList = []
  let prizesUserCount = 0
  lotteryInfo.lotteryPrize.forEach(prize => {
    if (prize?.prizeUserList) {
      // prizesUserList.push(...prize?.prizeUserList)
      prizesUserCount += prize?.prizeUserList.length || 0
    }
  })
  return {
    count, //奖品总数
    percentage, // 中奖率
    isOverCount, //已结束奖项
    prizesUserCount, //中奖用户集合
    barWidth: `${Math.round(isOverCount / lotteryInfo.lotteryPrize.length * 100)}`, //抽奖活动进度，取整数
  }
})


onMounted(() => {
  getLotteryInfo()
})

const getLotteryInfo = () => {
  const lotteryKey = route.query.lotteryKey
  if (!lotteryKey) {
    ElMessageBox.alert(`当前链接有误`, '温馨提示', {
      confirmButtonText: '确定',
    })
    return
  }

  queryLottery({ key: lotteryKey }).then(res => {
    if (res?.success) {
      // 处理抽奖信息
      const { title, desc, key, lotteryPrize, lotteryUser, status } = res.data[0] || {}
      lotteryInfo.title = title
      lotteryInfo.desc = desc
      lotteryInfo.key = key
      lotteryInfo.status = status
      lotteryInfo.lotteryPrize = lotteryPrize || []
      lotteryInfo.lotteryUserTotal = lotteryUser.length || 0
      lotteryInfo.prizeUserList = getPrizeUserList(lotteryInfo.lotteryPrize)
      isStatus()
      
    }
  })
}
const isStatus = () => {
  if (lotteryInfo.status !== true) {
    ElMessageBox.alert(`当前抽奖活动未开始`, '温馨提示', {
      confirmButtonText: '确定',
    })
    return
  }
}
</script>

<style scoped>
/* 粒子背景效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(192, 132, 252, 0.06) 0%, transparent 50%);
  animation: particleFloat 8s ease-in-out infinite;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.02);
  }
}

/* 文字截断 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 自定义阴影 */
.shadow-3xl {
  box-shadow: 0 35px 60px -15px rgba(139, 92, 246, 0.3);
}

/* 底部栏动画 */
footer {
  animation: slideUp 0.8s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>