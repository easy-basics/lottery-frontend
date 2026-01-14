<template>
  <div class="big-screen">
    <div class="header">
      <h1 class="main-title">{{ prizeInfo.title || '幸运大抽奖'}}</h1>
      <div class="main-desc" v-if="prizeInfo.desc">{{ prizeInfo.desc}}</div>
    </div>

      <div class="main-area">
        <CanvasLottery ref="lotteryRef" :participants="userList" :winner-count="prizeInfo.prizeNum" theme-color="#FF8C00"
          @finished="onLotteryFinished"  v-if="userList.length > 0"/>
        <el-empty v-else description="请先添加员工" />
      </div>

    <div class="footer-actions" v-if="!prizeInfo?.isOver">
      <template v-if="userList.length > 0">
        <el-button v-if="!isRolling" type="warning" size="large" @click="handleStart" class="action-btn start">
          开始抽奖
        </el-button>
        <el-button v-else type="danger" size="large" @click="handleStop" class="action-btn stop">
          停止
        </el-button>
      </template>
      <el-button v-else type="danger" size="large" @click="handleReturn" class="action-btn stop">
        返回
      </el-button>
    </div>
    <div class="footer-actions" v-else>
      <el-button type="danger" size="large" @click="handleReturn" class="action-btn stop">
        返回
      </el-button>
    </div>

    

    <!-- <el-dialog v-model="showResult" title="中奖名单" width="500px" center>
      <el-table :data="winnerResults" max-height="400">
        <el-table-column property="name" label="姓名" />
        <el-table-column property="id" label="工号" />
      </el-table>
    </el-dialog> -->
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, shallowRef } from 'vue';
import CanvasLottery from '@/components/CanvasLottery.vue';
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { queryLottery, deleteLottery, updateLottery } from '@/utils/indexedDB'
const route = useRoute()
const router = useRouter()
const userList = shallowRef([])
// const isOver = ref(false)

const prizeInfo = reactive({
  title: '',
  desc: '',
  isOver: false,
  prizeNum: '',
  prizeUserList: [], // 中奖用户列表
})

onMounted(() => {
  getLotteryInfo()
})



const lotteryRef = ref(null);
const isRolling = ref(false);
const showResult = ref(false);
// const winnerResults = ref([]);

const getLotteryInfo = () => {
  const lotteryKey = route.query.lotteryKey
  const prizeIndex = route.query.prizeIndex
  if (!lotteryKey || !prizeIndex) {
    ElMessageBox.alert(`当前链接有误`, '温馨提示', {
      confirmButtonText: '确定',
    })
    return
  }

  queryLottery({ key: lotteryKey }).then(res => {
    if (res?.success) {
      const { lotteryPrize, lotteryUser, status } = res.data[0]
      const prizeNowInfo = lotteryPrize[Number(prizeIndex)]
      if (prizeNowInfo.isOver) {
        ElMessageBox.alert(`当前奖项已抽完`, '温馨提示', {
          confirmButtonText: '确定',
        }).then(() => {
          router.replace({
            path: '/',
            query: {
              lotteryKey: route.query.lotteryKey,
            }
          })
        })
        return
      }
      if (!status) {
        ElMessageBox.alert(`当前抽奖活动未开始`, '温馨提示', {
          confirmButtonText: '确定',
        }).then(() => {
          router.replace({
            path: '/',
            query: {
              lotteryKey: route.query.lotteryKey,
            }
          })
        })
        return
      }
      prizeInfo.title = prizeNowInfo.title
      prizeInfo.desc = prizeNowInfo.desc
      prizeInfo.prizeNum = prizeNowInfo.prizeNum
      setUserList(res.data[0], prizeNowInfo)
    }
  })
}

const setUserList = (data, prizeNowInfo) => {
  if (['是', true].includes(prizeNowInfo.isDeduplication)) {
    userList.value = data.lotteryUser
    return
  } 

  const havePrizeUserList = [] //已经中奖用户ldap集合
  data.lotteryPrize.forEach(item => {
    item.prizeUserList.forEach(user => {
      havePrizeUserList.push(user.ldap)
    })
  })

  userList.value = filterUsers(data.lotteryUser, havePrizeUserList);
}

// 过滤出未中奖用户，已中奖的用户不再参与抽奖
const filterUsers = (userData, excludeLdaps) => {
  // 1. 将排除列表转换为 Set（O(n)）
  const excludeSet = new Set(excludeLdaps);
  // 2. 过滤用户数据（O(m)，其中 m = userData.length）
  return userData.filter(user => !excludeSet.has(user.ldap));
}



const handleStart = () => {
  isRolling.value = true;
  lotteryRef.value.start();
};

const handleStop = () => {
  lotteryRef.value.stop();
};
const handleReturn = () => {
  router.push({
    path: '/',
    query: {
      lotteryKey: route.query.lotteryKey,
    }
  })
}



const onLotteryFinished = (results) => {
  // isRolling.value = false;
  // winnerResults.value = results;
  // 这里可以进行 API 调用，保存中奖信息
  // console.log('中奖人员信息已汇总：', results);
  prizeInfo.isOver = true
  savePrizeInfo(results)
  // setTimeout(() => {
  //   showResult.value = true;
  // }, 1000);
};

const savePrizeInfo = (results) => {
  const lotteryKey = route.query.lotteryKey
  const prizeIndex = route.query.prizeIndex
  queryLottery({ key: lotteryKey }).then(res => {
    if (res?.success) {
      const { lotteryPrize } = res.data[0]
      const prizeNowInfo = lotteryPrize[Number(prizeIndex)]
      prizeNowInfo.prizeUserList = results
      prizeNowInfo.isOver = true
      updateLottery({
        key: lotteryKey,
        lotteryPrize,
      }).then(res => {
        if (res?.success) {
          ElMessage.success('保存成功')
        }
      })
    }
  })
  
}
</script>

<style scoped>
.big-screen {
  /* 强制锁定视口，禁止滚动 */
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000;
  display: flex;
  flex-direction: column;
}

.header {
  /* 头部高度固定，剩余空间全给抽奖区 */
  height: 15vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.main-title {
  font-size: 54px;
  line-height: 1;
  color: #ffae42;
  text-shadow: 0 2px 15px rgba(255, 140, 0, 0.6);
  margin-bottom: 10px;
  font-weight: 800;
}
.main-desc{
  font-size: 20px;
  line-height: 1;
  color: #d59036;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.6);
  margin-bottom: 30px;
  font-weight: 600;
}

.main-area {
  /* 关键：占据剩余的所有空间 */
  flex: 1;
  width: 100%;
  padding: 2vh 2vw;
  box-sizing: border-box;
  overflow: hidden;
  /* 防止 Canvas 微弱溢出触发滚动条 */
}

.footer-actions {
  height: 15vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 针对大屏的按钮尺寸优化 */
.action-btn {
  height: 8vh !important;
  padding: 0 5vw !important;
  font-size: 3vh !important;
  /* 字体随高度缩放 */
}
</style>