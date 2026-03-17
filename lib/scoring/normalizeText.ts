/**
 * normalizeText
 * 用于统一文本格式，避免听写(WFD)因为大小写或标点导致误判
 */

export function normalizeText(text: string): string {
  return text
    .toLowerCase()                 // 转小写
    .replace(/[’']/g, "")          // 去掉撇号
    .replace(/[^a-z0-9\s]/g, "")   // 去掉标点符号
    .replace(/\s+/g, " ")          // 多个空格变一个
    .trim();                       // 去掉首尾空格
}