/**
 * 图片迁移工具
 * 将现有的 base64 图片从 localStorage 迁移到 IndexedDB
 */

import { DiaryEntry } from './types';
import { loadReadingEntries, saveReadingEntries } from './storage';
import { saveImageToIndexedDB } from '@/utils/common/imageStorage';

/**
 * 迁移单个书记的图片到 IndexedDB
 */
const migrateEntryImage = async (entry: DiaryEntry): Promise<DiaryEntry> => {
  // 如果已经有 imageId，说明已经迁移过了
  if (entry.imageId) {
    return entry;
  }
  
  // 如果有 image（base64），迁移到 IndexedDB
  if (entry.image && entry.image.trim() !== '') {
    try {
      const imageId = entry.id;
      await saveImageToIndexedDB(imageId, entry.image);
      
      // 返回迁移后的 entry（删除 image，添加 imageId）
      return {
        ...entry,
        imageId: imageId,
        image: undefined
      };
    } catch (error) {
      console.error(`迁移书记 ${entry.id} 的图片失败:`, error);
      // 迁移失败，保留原 entry
      return entry;
    }
  }
  
  // 没有图片，直接返回
  return entry;
};

/**
 * 迁移所有书记的图片到 IndexedDB
 * @returns 返回迁移统计信息
 */
export const migrateAllImagesToIndexedDB = async (): Promise<{
  total: number;
  migrated: number;
  failed: number;
  skipped: number;
}> => {
  const entries = loadReadingEntries();
  let migrated = 0;
  let failed = 0;
  let skipped = 0;
  
  const migratedEntries: DiaryEntry[] = [];
  
  for (const entry of entries) {
    // 如果已经有 imageId，跳过
    if (entry.imageId) {
      skipped++;
      migratedEntries.push(entry);
      continue;
    }
    
    // 如果没有 image，跳过
    if (!entry.image || entry.image.trim() === '') {
      skipped++;
      migratedEntries.push(entry);
      continue;
    }
    
    // 尝试迁移
    try {
      const migratedEntry = await migrateEntryImage(entry);
      migratedEntries.push(migratedEntry);
      migrated++;
    } catch (error) {
      console.error(`迁移书记 ${entry.id} 失败:`, error);
      migratedEntries.push(entry); // 保留原 entry
      failed++;
    }
  }
  
  // 保存迁移后的数据
  if (migrated > 0 || failed > 0) {
    saveReadingEntries(migratedEntries);
  }
  
  return {
    total: entries.length,
    migrated,
    failed,
    skipped
  };
};

/**
 * 检查是否需要迁移
 */
export const needsImageMigration = (): boolean => {
  const entries = loadReadingEntries();
  // 如果有任何 entry 有 image 但没有 imageId，需要迁移
  return entries.some(entry => entry.image && !entry.imageId);
};

