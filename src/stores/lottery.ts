import { defineStore } from 'pinia'
import { useRoute } from 'vue-router'
import { queryLottery } from '@/utils/indexedDB'

const route = useRoute()

export interface Prize {
  name: string
  desc: string
  
  
}

export interface LotteryNow {
  id: string
  key: string
  title: string
  desc: string
  count: number //奖品总数
  percentage: number // 中奖率
  // isOverCount: number //已结束奖项
  prizesUserList: Array //中奖用户集合
  // barWidth: `${Math.round(isOverCount / lotteryInfo.lotteryPrize.length * 100)}`, / / 抽奖活动进度，取整数
  barWidth: number, // 抽奖活动进度，取整数
  nowPrize: Prize | null // 当前正在抽奖的奖品
}

export interface LotteryState {
  // 抽奖活动信息
  lotteryInfo: LotteryInfo | null
  // 当前抽奖状态
  isLotteryActive: boolean
  // 抽奖结果
  lotteryResult: Prize | null
  // 中奖名单
  winnersList: Array<{
    id: string
    name: string
    prize: string
    time: string
  }>
  // 加载状态
  loading: boolean
  // 错误信息
  error: string | null
}

export const useLotteryStore = defineStore('lottery', {
  state: (): LotteryState => ({
    lotteryInfo: null,
    isLotteryActive: false,
    lotteryResult: null,
    winnersList: [],
    loading: false,
    error: null
  }),

  getters: {
    // 获取当前活动状态
    activityStatus: (state) => state.lotteryInfo?.status || 'pending',
    
    // 获取参与人数
    participantsCount: (state) => state.lotteryInfo?.totalParticipants || 0,
    
    // 获取中奖人数
    winnersCount: (state) => state.lotteryInfo?.totalWinners || 0,
    
    // 计算中奖率
    winningRate: (state) => {
      if (!state.lotteryInfo?.totalParticipants) return 0
      return (state.lotteryInfo.totalWinners / state.lotteryInfo.totalParticipants) * 100
    },
    
    // 获取奖品列表
    prizes: (state) => state.lotteryInfo?.lotteryPrize || [],
    
    // 检查是否还有奖品
    hasRemainingPrizes: (state) => {
      if (!state.lotteryInfo?.lotteryPrize) return false
      return state.lotteryInfo.lotteryPrize.some(prize => prize.count > 0)
    }
  },

  actions: {
    // 设置抽奖活动信息
    setLotteryInfo(info: LotteryInfo) {
      this.lotteryInfo = info
      this.error = null
    },

    // 开始抽奖
    startLottery() {
      if (!this.lotteryInfo) {
        this.error = '抽奖活动信息未设置'
        return false
      }
      
      if (this.lotteryInfo.status !== 'active') {
        this.error = '抽奖活动未开始或已结束'
        return false
      }
      
      if (!this.hasRemainingPrizes) {
        this.error = '所有奖品已抽完'
        return false
      }
      
      this.isLotteryActive = true
      this.lotteryResult = null
      this.error = null
      return true
    },

    // 结束抽奖并设置结果
    finishLottery(prize: Prize) {
      this.isLotteryActive = false
      this.lotteryResult = prize
      
      // 更新奖品数量
      if (this.lotteryInfo && this.lotteryInfo.lotteryPrize) {
        const prizeIndex = this.lotteryInfo.lotteryPrize.findIndex(p => p.id === prize.id)
        if (prizeIndex !== -1 && this.lotteryInfo.lotteryPrize[prizeIndex].count > 0) {
          this.lotteryInfo.lotteryPrize[prizeIndex].count--
          this.lotteryInfo.totalWinners++
        }
      }
      
      // 添加到中奖名单
      this.winnersList.unshift({
        id: Date.now().toString(),
        name: `用户${Math.floor(Math.random() * 1000)}`,
        prize: prize.name,
        time: new Date().toLocaleString()
      })
    },

    // 重置抽奖结果
    resetLotteryResult() {
      this.lotteryResult = null
    },

    // 设置加载状态
    setLoading(loading: boolean) {
      this.loading = loading
    },

    // 设置错误信息
    setError(error: string | null) {
      this.error = error
    },

    // 清空状态
    clear() {
      this.lotteryInfo = null
      this.isLotteryActive = false
      this.lotteryResult = null
      this.winnersList = []
      this.loading = false
      this.error = null
    }
  }
})