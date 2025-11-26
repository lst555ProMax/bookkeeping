/**
 * 书记相关类型定义
 */

// 复用日记的类型定义
export * from '../diary/types';

// 类型别名，提供更语义化的名称
import type { QuickNote, DiaryEntry } from '../diary/types';

export type ReadingExcerpt = QuickNote;
export type ReadingEntry = DiaryEntry;

