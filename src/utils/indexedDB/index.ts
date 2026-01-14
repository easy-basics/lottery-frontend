import DexieDB from './dexieServer'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-es'

// 抽奖数据库
const LOTTERY_DB_V1 = new DexieDB('LOTTERY_DB_V1', 1, {
  lottery: '++id, key, title, desc, status, type, lotteryPrize , lotteryUser, PrizeUser, [key+title]',
})

// 删除数据库的函数
export async function DELETE_DATABASES() {
  try {
    // 强制关闭现有连接
    if (LOTTERY_DB_V1.db) await LOTTERY_DB_V1.db.close()
    // 删除 ChatListDB
    const DELETE_LOTTERY_DB_V1 = indexedDB.deleteDatabase('LOTTERY_DB_V1')

    // 等待删除操作完成
    await Promise.all([
      new Promise((resolve, reject) => {
        DELETE_LOTTERY_DB_V1.onsuccess = resolve
        DELETE_LOTTERY_DB_V1.onerror = reject
      }),
    ])

    // return queryDataAndSaveData({
    //   api_name: 'query_by_user',
    // }, () => http.post(url, param))
    console.log('数据库已成功删除')
  } catch (error) {
    console.error('删除数据库时出现错误:', error)
  }
}

// 添加抽奖
export async function addLottery(data) {
  const cloneData = cloneDeep(data)
  return await LOTTERY_DB_V1.add({
    key: uuidv4(),
    ...cloneData,
  })
}

// 查询抽奖
export async function queryLottery(data = {}) {
  const cloneData = cloneDeep(data)
  return await LOTTERY_DB_V1.get({
    ...cloneData,
  })
}
// 更新抽奖
export async function updateLottery(data) {
  return await LOTTERY_DB_V1.update({
    key: data.key,
  }, data)
}
// 删除抽奖
export async function deleteLottery(data) {
  return await LOTTERY_DB_V1.delete({
    key: data.key,
  })
}


// // 查询数据并保存或更新数据
// // 当查询有时并未过期直接从数据库获取
// // 当查询没有时或状态过期时从接口获取并保存到数据库
// async function queryDataAndSaveData(query = {}, fn = (res) => res) {
//   if (!window.indexedDB) {
//     return fn()
//   }
//   let hashToken = simpleHash(getToken())
//   let hashKey = simpleHash(query.key || '')

//   const res = await LOTTERY_DB_V1.get({
//     ...query,
//     token: hashToken,
//     key: hashKey,
//   })
//   if (res.data && res.data.length > 0) {
//     return res.data[0].data
//   } else {
//     const requestRes = await fn()
//     await LOTTERY_DB_V1.update({
//       api_name: query.api_name,
//       key: hashKey,
//     }, {
//       ...query,
//       token: hashToken,
//       data: requestRes,
//       key: hashKey,
//     })
//     return requestRes
//   }
// }


// function simpleHash(longString) {
//   let hash = 0;
//   for (let i = 0; i < longString.length; i++) {
//     const char = longString.charCodeAt(i);
//     hash = (hash << 5) - hash + char;
//     hash = hash & hash; // Convert to 32bit integer
//   }
//   return Math.abs(hash).toString(16).slice(0, 8);
// }

// export { queryDataAndSaveData, DELETE_DATABASES }
