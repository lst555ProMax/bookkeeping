/**
 * 病记数据存储管理
 */

import { QuickNote } from '@/utils/diary/types';

const MEDICAL_QUICK_NOTES_KEY = 'medical_quick_notes';

/**
 * 加载病记列表
 */
export const loadMedicalQuickNotes = (): QuickNote[] => {
  try {
    const data = localStorage.getItem(MEDICAL_QUICK_NOTES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载病记失败:', error);
    return [];
  }
};

/**
 * 保存病记列表
 */
export const saveMedicalQuickNotes = (notes: QuickNote[]): void => {
  try {
    localStorage.setItem(MEDICAL_QUICK_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('保存病记失败:', error);
  }
};

/**
 * 添加病记
 */
export const addMedicalQuickNote = (content: string): QuickNote => {
  const note: QuickNote = {
    id: Date.now().toString(),
    content,
    timestamp: Date.now(),
  };
  
  const notes = loadMedicalQuickNotes();
  notes.unshift(note);
  saveMedicalQuickNotes(notes);
  
  return note;
};

/**
 * 更新病记
 */
export const updateMedicalQuickNote = (id: string, content: string): QuickNote | null => {
  const notes = loadMedicalQuickNotes();
  const index = notes.findIndex(note => note.id === id);
  
  if (index === -1) return null;
  
  notes[index] = {
    ...notes[index],
    content,
    timestamp: Date.now(), // 更新时间戳
  };
  
  saveMedicalQuickNotes(notes);
  return notes[index];
};

/**
 * 删除病记
 */
export const deleteMedicalQuickNote = (id: string): void => {
  const notes = loadMedicalQuickNotes();
  const filtered = notes.filter(note => note.id !== id);
  saveMedicalQuickNotes(filtered);
};

/**
 * 清空所有病记
 */
export const clearAllMedicalQuickNotes = (): number => {
  const notes = loadMedicalQuickNotes();
  const count = notes.length;
  saveMedicalQuickNotes([]);
  return count;
};

