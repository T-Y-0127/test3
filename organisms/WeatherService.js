// organisms/WeatherService.js — 気象データ取得（Open-Meteo API）
import { state }              from '../store/state.js';
import { STATIONS }           from '../data/stations.js';
import { setStatus }          from '../atoms/StatusBar.js';
import { clearWxMarkers, addWxMarker } from '../molecules/WeatherPin.js';
import { drawOverlay }        from './OverlayCanvas.js';

export async function fetchWeather() {
  setStatus('気象データ取得中...');
  const results = await Promise.allSettled(STATIONS.map(fetchStation));
  clearWxMarkers();
  let ok = 0;
  results.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value) {
      addWxMarker(STATIONS[i], r.value);
      ok++;
    }
  });
  drawOverlay();
  if (ok > 0) {
    setStatus(`最終更新: ${new Date().toLocaleTimeString('ja-JP')} (${ok}/${STATIONS.length}地点)`, 4000);
  } else {
    setStatus('気象データ取得失敗（地図は表示中）— ↺ 更新ボタンで再試行', 8000);
  }
}

async function fetchStation(st) {
  const fetchWithTimeout = (url, ms = 8000) => {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), ms);
    return fetch(url, { signal: ctrl.signal })
      .then(r => { clearTimeout(timer); return r.ok ? r.json() : null; })
      .catch(() => { clearTimeout(timer); return null; });
  };

  const [wx, marine] = await Promise.all([
    fetchWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${st.lat}&longitude=${st.lng}` +
      `&current=temperature_2m,windspeed_10m,winddirection_10m,weathercode` +
      `&hourly=weathercode,windspeed_10m,winddirection_10m` +
      `&wind_speed_unit=ms&timezone=Asia%2FTokyo&forecast_days=2`
    ),
    fetchWithTimeout(
      `https://marine-api.open-meteo.com/v1/marine?latitude=${st.lat}&longitude=${st.lng}` +
      `&current=wave_height,wave_period,wave_direction&timezone=Asia%2FTokyo`
    ),
  ]);

  if (!wx?.current) return null;

  // 現在時刻のhourlyインデックスを特定
  const nowISO  = new Date().toISOString().slice(0, 13);
  const times   = wx.hourly?.time ?? [];
  let baseIdx   = times.findIndex(t => t.startsWith(nowISO));
  if (baseIdx < 0) baseIdx = 0;

  const forecast = {};
  for (const offset of [0, 1, 2, 3, 6, 12, 24]) {
    const idx = baseIdx + offset;
    forecast[offset] = {
      wcode:   wx.hourly?.weathercode?.[idx]       ?? wx.current.weathercode      ?? 0,
      wind:    wx.hourly?.windspeed_10m?.[idx]      ?? wx.current.windspeed_10m    ?? null,
      winddir: wx.hourly?.winddirection_10m?.[idx]  ?? wx.current.winddirection_10m ?? null,
    };
  }

  return {
    temp:       wx.current.temperature_2m     ?? null,
    wind:       wx.current.windspeed_10m      ?? null,
    winddir:    wx.current.winddirection_10m  ?? null,
    wcode:      wx.current.weathercode        ?? 0,
    forecast,
    wave:       marine?.current?.wave_height  ?? null,
    wavePeriod: marine?.current?.wave_period  ?? null,
    waveDir:    marine?.current?.wave_direction ?? null,
  };
}
