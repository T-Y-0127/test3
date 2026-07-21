// organisms/Header.js — ヘッダーのすべてのボタン制御
import { state }        from '../store/state.js';
import { drawOverlay }  from './OverlayCanvas.js';
import { fetchWeather } from './WeatherService.js';

export function toggleOverlay() {
  state.overlayVisible  = !state.overlayVisible;
  state.wxMarkersVisible = state.overlayVisible;
  const btn    = document.getElementById('btn-overlay');
  const canvas = document.getElementById('heatmap-canvas');
  const lg     = document.getElementById('layer-group');
  const fg     = document.getElementById('forecast-group');

  if (state.overlayVisible) {
    btn.classList.add('active');
    btn.textContent = '気象 ON';
    canvas.style.display = '';
    lg?.classList.remove('disabled');
    fg?.classList.remove('disabled');
    state.wxMarkers.forEach(m => { const el = m.getElement(); if (el) el.style.display = ''; });
    drawOverlay();
  } else {
    btn.classList.remove('active');
    btn.textContent = '気象 OFF';
    canvas.style.display = 'none';
    lg?.classList.add('disabled');
    fg?.classList.add('disabled');
    state.wxMarkers.forEach(m => { const el = m.getElement(); if (el) el.style.display = 'none'; });
  }
}

export function toggleWind() {
  state.windVisible = !state.windVisible;
  const btn = document.getElementById('btn-wind');
  btn.classList.toggle('active', state.windVisible);
  btn.textContent = state.windVisible ? '風向き ON' : '風向き OFF';
  drawOverlay();
}

export function setForecast(offset) {
  state.forecastOffset = offset;
  [0, 1, 2, 3, 6, 12, 24].forEach(i => {
    const b = document.getElementById(`fc-${i}`);
    if (b) b.classList.toggle('active', i === offset);
  });
  if (state.overlayVisible) drawOverlay();
}

export function setLayer(layer) {
  state.currentLayer = layer;
  if (state.overlayVisible) drawOverlay();
}

// HTML の onclick から呼べるようにグローバルへ登録
window.toggleOverlay = toggleOverlay;
window.toggleWind    = toggleWind;
window.setForecast   = setForecast;
window.setLayer      = setLayer;
window.fetchWeather  = fetchWeather;
