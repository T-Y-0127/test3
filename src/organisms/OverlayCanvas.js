// organisms/OverlayCanvas.js — 雨雲レーダー＋風矢印をcanvasに描画
import { state }          from '../store/state.js';
import { radarColor }     from '../utils/weatherUtils.js';
import { windSpeedColor, windArrowDeg } from '../utils/windUtils.js';
import { isOnLand }       from '../utils/geoUtils.js';

export function drawOverlay() {
  const canvas = document.getElementById('heatmap-canvas');
  if (!state.overlayVisible) { canvas.style.display = 'none'; return; }
  canvas.style.display = 'block';

  const wrap = document.getElementById('map-wrap');
  const rect = wrap.getBoundingClientRect();
  const W = Math.round(rect.width  || wrap.offsetWidth  || 800);
  const H = Math.round(rect.height || wrap.offsetHeight || 600);
  canvas.width  = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  if (state.wxMarkers.length === 0) return;

  const zoom = state.map.getZoom();
  const pts  = state.wxMarkers.map(m => {
    const { st, d } = m._wxData;
    const p = state.map.latLngToContainerPoint([st.lat, st.lng]);
    return { px: p.x, py: p.y, st, d };
  });

  // ── 雨雲レーダー ブロック塗り ──
  const CELL = Math.max(4, Math.round(160 / zoom));
  for (let cy = 0; cy < H; cy += CELL) {
    for (let cx = 0; cx < W; cx += CELL) {
      const mx = cx + CELL / 2, my = cy + CELL / 2;
      let best = null, bestD2 = Infinity;
      for (const p of pts) {
        const d2 = (mx - p.px) ** 2 + (my - p.py) ** 2;
        if (d2 < bestD2) { bestD2 = d2; best = p; }
      }
      if (!best) continue;
      const fc    = best.d.forecast?.[state.forecastOffset] ?? best.d.forecast?.[0];
      const wcode = fc?.wcode ?? best.d.wcode ?? 0;
      const c     = radarColor(wcode);
      if (!c) continue;
      ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a})`;
      ctx.fillRect(cx, cy, CELL, CELL);
    }
  }

  // ── 風矢印 ──
  if (!state.windVisible) return;
  const windPts  = pts.filter(p => p.d.wind != null && p.d.winddir != null);
  const STEP     = Math.max(10, Math.round(460 / zoom));
  const ARROW_LEN = Math.min(28, Math.max(10, Math.round(STEP * 0.58)));

  for (let gy = STEP / 2; gy < H; gy += STEP) {
    for (let gx = STEP / 2; gx < W; gx += STEP) {
      let best = null, bestD2 = Infinity;
      for (const p of windPts) {
        const d2 = (gx - p.px) ** 2 + (gy - p.py) ** 2;
        if (d2 < bestD2) { bestD2 = d2; best = p; }
      }
      if (!best) continue;
      const ll = state.map.containerPointToLatLng([gx, gy]);
      if (isOnLand(ll.lng, ll.lat)) continue;

      const fc   = best.d.forecast?.[state.forecastOffset] ?? best.d.forecast?.[0];
      const wdir = fc?.winddir ?? best.d.winddir;
      const wspd = fc?.wind    ?? best.d.wind;
      if (wdir == null || wspd == null) continue;

      _drawArrow(ctx, gx, gy, wdir, wspd, ARROW_LEN);
    }
  }
}

function _drawArrow(ctx, cx, cy, winddir, spd, len) {
  const angle = (winddir + 180 - 90) * Math.PI / 180;
  const x2    = cx + Math.cos(angle) * len;
  const y2    = cy + Math.sin(angle) * len;
  const color = windSpeedColor(spd);
  const aw    = 0.42;
  const al    = Math.max(5, len * 0.32);

  ctx.save();
  ctx.lineCap = 'round';
  // 黒縁
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.lineWidth   = 3.5;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - al * Math.cos(angle - aw), y2 - al * Math.sin(angle - aw));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - al * Math.cos(angle + aw), y2 - al * Math.sin(angle + aw));
  ctx.stroke();
  // 本体
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - al * Math.cos(angle - aw), y2 - al * Math.sin(angle - aw));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - al * Math.cos(angle + aw), y2 - al * Math.sin(angle + aw));
  ctx.stroke();
  // 起点の丸
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
