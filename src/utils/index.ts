/**
 * ldap 去重
 * 对于大数据量（1万条）的优化版本
**/
export function deduplicateUsersOptimized(users) {
  const seen = new Map();
  const duplicates = new Map();
  const uniqueUsers = new Array(Math.min(users.length, 10000)); // 预分配数组大小
  let uniqueIndex = 0;

  // 使用for循环而不是forEach，性能更好
  for (let i = 0; i < users.length && i < 10000; i++) {
    const user = users[i];
    if (!user || typeof user !== 'object') continue;

    const ldap = user.ldap;
    if (ldap === null || ldap === undefined) continue;

    // 优化处理逻辑
    const processedLdap = ldap.toString().trim().toLowerCase();

    const existing = seen.get(processedLdap);
    if (existing !== undefined) {
      // 记录重复
      duplicates.set(processedLdap, (duplicates.get(processedLdap) || 1) + 1);
    } else {
      // 保存第一个出现的用户
      const newUser = {
        ldap: processedLdap,
        name: user.name,
        org: user.org
      };

      seen.set(processedLdap, newUser);
      uniqueUsers[uniqueIndex++] = newUser;
    }
  }

  // 调整数组大小
  uniqueUsers.length = uniqueIndex;

  return {
    uniqueUsers,
    duplicates: Object.fromEntries(duplicates),
    duplicateCount: Array.from(duplicates.values()).reduce((sum, count) => sum + (count - 1), 0)
  };
}

export const getPrizeUserList = (lotteryPrize) => {
  const PrizeUser = []
  lotteryPrize.map(i => {
    i.prizeUserList.map(s => {
      PrizeUser.push({
        ldap: s.ldap,
        name: s.name,
        org: s.org,
        prizeName: i.title
      })
    })
  })
  return PrizeUser
}