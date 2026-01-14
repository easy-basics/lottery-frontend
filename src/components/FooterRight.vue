<template>
  <!-- 底部版权信息和技术支持栏 -->
  <footer
    class="relative z-10 bg-gradient-to-r from-purple-800/30 via-violet-800/30 to-indigo-800/30 backdrop-blur-lg border-t border-purple-400/20">
    <div class="container mx-auto px-6 py-8">
      <!-- 主要内容区域 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
        <!-- 版权信息 -->
        <div class="text-center md:text-left">
          <div class="flex items-center justify-center md:justify-start space-x-2 mb-2">
            <div
              class="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-bold">🎯</span>
            </div>
            <span class="text-white text-lg font-semibold">幸运抽奖系统</span>
          </div>
          <p class="text-purple-200 text-sm">
            © 2026 幸运抽奖系统 版权所有
          </p>
          <p class="text-purple-300 text-xs mt-1">
            打造最公平、最有趣的抽奖体验
          </p>
        </div>

        <!-- 技术支持信息 -->
        <div class="text-center min-w-0">
          <div class="inline-flex items-center space-x-4 flex-nowrap whitespace-nowrap">
            <div class="flex items-center space-x-2">
              <span class="text-purple-300 text-sm">技术支持:</span>
              <span class="text-white hover:text-purple-300 transition-colors text-sm font-medium">
                技术组-资源池
              </span>
            </div>
            <!-- <div class="w-px h-4 bg-purple-400/30"></div> -->
            <!-- <div class="flex items-center space-x-2">
              <span class="text-purple-300 text-sm">邮箱:</span>
              <a href="mailto:support@luckydraw.com"
                class="text-white hover:text-purple-300 transition-colors text-sm font-medium">
                ✉️ support@luckydraw.com
              </a>
            </div> -->
          </div>
          <p class="text-purple-200 text-xs mt-2">
            工作日 9:00-18:00 提供技术支持
          </p>
        </div>

        <!-- 快速链接 -->
        <div class="text-center md:text-right">
          <div class="flex justify-center md:justify-end space-x-4">
            <a href="javascript:void(0);" class="text-purple-200 hover:text-white transition-colors text-sm">
              隐私政策
            </a>
            <div class="w-px h-4 bg-purple-400/30"></div>
            <a href="javascript:void(0);" class="text-purple-200 hover:text-white transition-colors text-sm">
              使用条款
            </a>
            <div class="w-px h-4 bg-purple-400/30"></div>
            <a href="javascript:void(0);" @click="handleClickAdmin" class="text-purple-200 hover:text-white transition-colors text-sm">
              管理后台
            </a>
          </div>
          <div class="flex justify-center md:justify-end space-x-3 mt-3">
            <a href="javascript:void(0);"
              class="w-8 h-8 bg-purple-600/30 hover:bg-purple-500/50 rounded-full flex items-center justify-center transition-colors group">
              <span class="text-purple-200 group-hover:text-white text-sm">📱</span>
            </a>
            <a href="javascript:void(0);"
              class="w-8 h-8 bg-purple-600/30 hover:bg-purple-500/50 rounded-full flex items-center justify-center transition-colors group">
              <span class="text-purple-200 group-hover:text-white text-sm">💬</span>
            </a>
            <a href="javascript:void(0);"
              class="w-8 h-8 bg-purple-600/30 hover:bg-purple-500/50 rounded-full flex items-center justify-center transition-colors group">
              <span class="text-purple-200 group-hover:text-white text-sm">🔔</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 底部装饰线 -->
      <div class="mt-6 pt-6 border-t border-purple-400/20">
        <div class="text-center">
          <p class="text-purple-300/80 text-xs">
            本系统采用随机的抽奖算法，确保公平公正 |
            <span class="text-purple-200 font-medium">版本 v2.1.0</span> |
            最后更新: 2026-01-09
          </p>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400/40 to-transparent">
    </div>
  </footer>
</template>
<script setup lang="ts">
  import { useRouter } from 'vue-router'

  const router = useRouter()

  const handleClickAdmin = () => {
    router.replace({ name: 'lotteryActivity' })
  }
</script>