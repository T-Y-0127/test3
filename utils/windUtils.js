// utils/windUtils.js — 風向き・風速ユーティリティ

/** 風向（度）→ 16方位テキスト */
export function windDirText(deg) {
  if (deg == null) return '--';
  const dirs = ['北','北北東','北東','東北東','東','東南東','南東','南南東',
                 '南','南南西','南西','西南西','西','西北西','北西','北北西'];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** 風向（度）→ 矢印rotate角度（吹いていく方向） */
export function windArrowDeg(deg) {
  if (deg == null) return 0;
  return (deg + 180) % 360;
}

/** 風速(m/s) → キャンバス矢印用rgba色 */
export function windSpeedColor(spd) {
  if (spd == null || spd < 1) return 'rgba(180,180,180,0.90)';
  if (spd <  3) return 'rgba(130,220,255,0.93)';
  if (spd <  5) return 'rgba( 40,130,255,0.95)';
  if (spd < 10) return 'rgba(255,220,  0,0.95)';
  if (spd < 15) return 'rgba(255,140,  0,0.97)';
  return              'rgba(255, 50, 50,0.97)';
}

/** 風速(m/s) → ポップアップ用hex色 */
export function windColor(speed) {
  if (speed == null) return '#8ab4c8';
  if (speed <  3) return '#56ccf2';
  if (speed <  7) return '#00c9a7';
  if (speed < 11) return '#f5a623';
  if (speed < 17) return '#ff6b6b';
  return '#cc44ff';
}

/** 風速(m/s) → 日本語ラベル */
export function windLabel(speed) {
  if (speed == null) return '--';
  if (speed <  3) return '微風';
  if (speed <  7) return '軟風';
  if (speed < 11) return '強め';
  if (speed < 17) return '強風';
  return '暴風';
}
