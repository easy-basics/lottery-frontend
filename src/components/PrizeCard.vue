<template>
  <!-- 奖项展示区域 -->
  <div class="mb-16">
    <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-8">奖项设置</h2>

    <!-- 奖项卡片网格 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="(prize, index) in prizes" :key="index"
        class="group bg-gradient-to-br from-purple-600/30 to-violet-600/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-400/30 hover:border-purple-400/60 transition-all duration-500 hover:scale-105"
        >
        <!-- 奖项等级标签 -->
        <!-- <div class="flex justify-between items-center mb-4">
          <span
            class="px-3 py-1 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-semibold rounded-full">
            {{ prize.level }}
          </span>
          <span class="text-white/80 text-sm">{{ prize.count }}份</span>
        </div> -->

        <!-- 奖品图片 -->
        <div class="w-full h-48 bg-white/10 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
          <img v-if="prize.image" :src="prize.image" :alt="prize.name" @error="handleImageError"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
          <div v-else class="text-8xl text-white/50">
            🎁
          </div>
        </div>

        <!-- 奖品信息 -->
        <h3 class="text-xl font-bold text-white mb-2">{{ prize.title }}</h3>
        <p class="text-purple-200 text-sm mb-4 line-clamp-2">{{ prize.desc }}</p>

        <!-- 价值标签 -->
        <div class="flex justify-between items-center">
          <span class="text-yellow-300 font-semibold text-xl">{{ prize.prizeNum }} 份</span>
          <button
            @click="goToLottery(index)"
            :disabled="prize.isOver"
            :class="!prize.isOver ? 'cursor-pointer' : 'cursor-not-allowed'"
            class="px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-violet-600 transition-all duration-300">
            {{ prize.isOver ? '已结束' : '前往抽奖' }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 底部操作区域 -->
  <!-- <div class="text-center">
    <button @click="startLottery"
      class="relative bg-gradient-to-r from-purple-500 via-violet-500 to-pink-500 text-white px-8 py-4 md:px-12 md:py-5 text-xl md:text-2xl font-bold rounded-full hover:from-purple-600 hover:via-violet-600 hover:to-pink-600 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-3xl active:scale-95 overflow-hidden group">
      <span class="relative z-10">开始抽奖</span>
      <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      </div>
    </button>

    <p class="mt-4 text-purple-200 text-lg">
      点击按钮开始激动人心的抽奖环节
    </p>
  </div> -->
</template>
<script setup lang="ts">
// import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
// import { queryLottery } from '@/utils/indexedDB'
const route = useRoute()
const router = useRouter()
import liwuPng from '@/assets/images/liwu.png'
// 模拟奖项数据（实际应从API获取）
const props = defineProps({
  prizes: {
    type: Array,
    default: () => []
  },
  status: {
    type: Boolean,
    default: true
  }
})

// 图片加载错误处理
const handleImageError = (event) => {
  const target = event.target as HTMLImageElement
  target.src = liwuPng // 替换为你的默认图片路径
  target.onerror = null // 防止无限循环
}

// 跳转到抽奖页面
const goToLottery = (index) => {
  if (!props.status) {
    ElMessageBox.alert(`当前抽奖活动未开始`, '温馨提示', {
      confirmButtonText: '确定',
    })
    return
  }
  const lotteryKey = route.query.lotteryKey
  if (lotteryKey) {
    router.push({
      path: '/lottery',
      query: { lotteryKey, prizeIndex: index }
    })
  } else {
    ElMessage.warning('请先选择有效的抽奖活动')
  }
}
</script>