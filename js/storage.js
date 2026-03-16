/**
 * AI 批量查询助手 - 存储模块
 * 使用 IndexedDB 进行持久化存储
 */

class HistoryStorage {
  constructor() {
    this.dbName = 'AIQueryHistoryDB';
    this.dbVersion = 1;
    this.storeName = 'queries';
    this.db = null;
  }

  /**
   * 初始化 IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB 打开失败:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 创建对象存储
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, {
            keyPath: 'id',
            autoIncrement: true
          });

          // 创建索引
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('query', 'query', { unique: false });
        }
      };
    });
  }

  /**
   * 添加查询记录
   * @param {string} query - 查询内容
   * @param {string[]} tools - 使用的工具列表
   */
  async addRecord(query, tools) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const record = {
        query: query.substring(0, HISTORY_CONFIG.MAX_QUERY_LENGTH),
        tools: tools,
        timestamp: Date.now(),
        date: new Date().toISOString()
      };

      const request = store.add(record);

      request.onsuccess = () => {
        // 检查是否需要清理旧记录
        this.cleanupOldRecords();
        resolve(record);
      };

      request.onerror = () => {
        console.error('添加记录失败:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 获取所有历史记录
   * @param {number} limit - 限制数量
   */
  async getAllRecords(limit = 50) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');

      const request = index.openCursor(null, 'prev');
      const records = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor && records.length < limit) {
          records.push(cursor.value);
          cursor.continue();
        } else {
          resolve(records);
        }
      };

      request.onerror = () => {
        console.error('获取记录失败:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 清理旧记录，保持记录数量在限制内
   */
  async cleanupOldRecords() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      // 先获取总数
      const countRequest = store.count();

      countRequest.onsuccess = () => {
        const count = countRequest.result;

        if (count > HISTORY_CONFIG.MAX_RECORDS) {
          // 需要删除的记录数
          const deleteCount = count - HISTORY_CONFIG.MAX_RECORDS;

          // 按时间顺序删除最旧的记录
          const index = store.index('timestamp');
          const cursorRequest = index.openCursor();
          let deleted = 0;

          cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;

            if (cursor && deleted < deleteCount) {
              store.delete(cursor.primaryKey);
              deleted++;
              cursor.continue();
            } else {
              resolve();
            }
          };

          cursorRequest.onerror = () => {
            reject(cursorRequest.error);
          };
        } else {
          resolve();
        }
      };

      countRequest.onerror = () => {
        reject(countRequest.error);
      };
    });
  }

  /**
   * 清空所有历史记录
   */
  async clearAll() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        console.error('清空记录失败:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * 格式化时间显示
   * @param {number} timestamp - 时间戳
   */
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)} 分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)} 小时前`;
    } else if (diff < 7 * day) {
      return `${Math.floor(diff / day)} 天前`;
    } else {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
}

// 创建全局实例
const historyStorage = new HistoryStorage();
