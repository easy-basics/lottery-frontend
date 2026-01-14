import Dexie from 'dexie'

class DexieDB {
  constructor(dbName, version, tableSchema) {
    this.db = new Dexie(dbName)
    this.db.version(version).stores(tableSchema)
    this.tableName = Object.keys(tableSchema)[0]
    this.table = this.db.table(this.tableName)
  }

  // 新增数据
  async add(data) {
    try {
      const ids = await this.table.bulkAdd(Array.isArray(data) ? data : [data])
      return { success: true, data: Array.isArray(data) ? ids : ids[0] }
    }
    catch (error) {
      return { success: false, error }
    }
  }

  // 多条件删除
  async delete(conditions) {
    try {
      const query = this.table.where(conditions)
      const count = await query.delete()
      return { success: true, data: count }
    }
    catch (error) {
      return { success: false, error }
    }
  }

  // 多条件更新
  async update(conditions, changes) {
    try {
      const query = this.table.where(conditions)
      // 检查符合条件的数据是否存在
      const exists = await query.count() > 0;
      if (exists) {
        // console.log('存在')
        // changes = deepClone(changes)
        const count = await query.modify(changes)
        return { success: true, data: count }
      } else {
        console.log('不存在')

        this.add(changes)
      }
    } catch (error) {
      return { success: false, error }
    }
  }

  // 多条件查询
  // 多条件查询，若 conditions 为空对象，则查询所有记录
  async get(conditions = {}, options = {}) {
    try {
      let query
      if (Object.keys(conditions).length === 0) {
        // 如果 conditions 为空对象，直接获取全量数据
        query = this.table.toCollection()
        // query = this.table.orderBy('update_time').reverse() // 默认按更新时间倒序
      }
      else {
        // 如果 conditions 不为空，根据条件查询
        query = this.table.where(conditions)
      }

      // 如果 options 中指定了 orderBy，则按该字段排序
      if (options.orderBy) {
        query = query.sortBy(options.orderBy).reverse()
      }
      // 如果 options 中指定了 limit，则限制返回结果的数量
      if (options.limit) {
        query = query.limit(options.limit)
      }
      // 将查询结果转换为数组
      const result = await query.toArray()
      return { success: true, data: result }
    }
    catch (error) {
      return { success: false, error }
    }
  }
}

export default DexieDB
