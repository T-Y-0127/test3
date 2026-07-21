// utils/weatherUtils.js — 天気情報ユーティリティ

/** WMO天気コード → 絵文字 */
export function weatherIcon(code) {
  if (code === 0)  return '☀️';
  if (code <= 2)   return '⛅';
  if (code <= 45)  return '🌫️';
  if (code <= 67)  return '🌧️';
  if (code <= 77)  return '🌨️';
  if (code <= 82)  return '🌦️';
  return '⛈️';
}

/** WMO天気コード → ピン枠色 */
export function weatherColor(code) {
  if (code === 0)  return '#1D9E75';
  if (code <= 2)   return '#185FA5';
  if (code <= 67)  return '#f5a623';
  return '#ff6b6b';
}

/** WMO天気コード → 雨雲レーダー色（晴れ・霧はnull） */
export function radarColor(wcode) {
  if (wcode <= 45) return null;
  if (wcode <= 55) return { r:  50, g: 220, b: 120, a: 0.65 }; // 弱雨: 緑
  if (wcode <= 65) return { r: 200, g: 230, b:   0, a: 0.72 }; // 中雨: 黄緑
  if (wcode <= 75) return { r: 255, g: 160, b:   0, a: 0.80 }; // 強雨: 橙
  if (wcode <= 82) return { r: 255, g:  60, b:  20, a: 0.87 }; // 激雨: 赤
  return                  { r: 200, g:   0, b: 200, a: 0.90 }; // 雷雨: 紫
}
