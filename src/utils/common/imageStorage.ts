/**
 * 图片存储管理（使用 IndexedDB）
 * 将图片从 localStorage 迁移到 IndexedDB，释放存储空间
 */

const DB_NAME = 'bookkeeping_images';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// 数据库实例缓存
let dbInstance: IDBDatabase | null = null;

/**
 * 打开 IndexedDB 数据库
 */
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // 如果已经有缓存的实例，直接返回
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('打开 IndexedDB 失败'));
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      // 创建对象存储（如果不存在）
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

/**
 * 保存图片到 IndexedDB
 * @param imageId 图片ID（通常是 entry.id）
 * @param base64Data base64 格式的图片数据
 */
export const saveImageToIndexedDB = async (imageId: string, base64Data: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const imageData = {
      id: imageId,
      data: base64Data,
      timestamp: Date.now()
    };

    await new Promise<void>((resolve, reject) => {
      const request = store.put(imageData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('保存图片失败'));
    });
  } catch (error) {
    console.error('保存图片到 IndexedDB 失败:', error);
    throw error;
  }
};

/**
 * 从 IndexedDB 读取图片
 * @param imageId 图片ID
 * @returns base64 格式的图片数据，如果不存在返回 undefined
 */
export const getImageFromIndexedDB = async (imageId: string): Promise<string | undefined> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise<string | undefined>((resolve, reject) => {
      const request = store.get(imageId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : undefined);
      };
      request.onerror = () => reject(new Error('读取图片失败'));
    });
  } catch (error) {
    console.error('从 IndexedDB 读取图片失败:', error);
    return undefined;
  }
};

/**
 * 从 IndexedDB 删除图片
 * @param imageId 图片ID
 */
export const deleteImageFromIndexedDB = async (imageId: string): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.delete(imageId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('删除图片失败'));
    });
  } catch (error) {
    console.error('从 IndexedDB 删除图片失败:', error);
    // 删除失败不抛出错误，避免影响主流程
  }
};

/**
 * 批量删除图片
 * @param imageIds 图片ID数组
 */
export const deleteImagesFromIndexedDB = async (imageIds: string[]): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await Promise.all(
      imageIds.map(
        (id) =>
          new Promise<void>((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error(`删除图片 ${id} 失败`));
          })
      )
    );
  } catch (error) {
    console.error('批量删除图片失败:', error);
    // 删除失败不抛出错误，避免影响主流程
  }
};

/**
 * 检查图片是否存在
 * @param imageId 图片ID
 */
export const hasImageInIndexedDB = async (imageId: string): Promise<boolean> => {
  try {
    const image = await getImageFromIndexedDB(imageId);
    return image !== undefined;
  } catch (error) {
    return false;
  }
};

