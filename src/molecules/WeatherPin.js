// molecules/WeatherPin.js — 気象ラベルピン（Leafletマーカー）
import { state }                          from '../store/state.js';
import { weatherIcon, weatherColor }      from '../utils/weatherUtils.js';
import { windColor, windArrowDeg, windDirText, windLabel, windSpeedColor } from '../utils/windUtils.js';

export function clearWxMarkers() {
  state.wxMarkers.forEach(m => state.map.removeLayer(m));
  state.wxMarkers = [];
}

export function addWxMarker(st, d) {
  const icon_str     = weatherIcon(d.wcode);
  const color        = weatherColor(d.wcode);
  const wColor       = windColor(d.wind);
  const arrowDeg     = windArrowDeg(d.winddir);
  const windSpeedStr = d.wind != null ? d.wind.toFixed(1) : '--';

  const labelHtml = `
    <div class="wx-label" style="border-color:${color}">
      <div class="wx-label-top">
        <span class="m-icon">${icon_str}</span>
        <span class="m-name">${st.name}</span>
      </div>
      <div class="wx-wind-row">
        <svg class="wind-arrow" viewBox="0 0 16 16"
             style="transform:rotate(${arrowDeg}deg)">
          <polygon points="8,1 12,13 8,10 4,13" fill="${wColor}"/>
        </svg>
        <span class="m-wind" style="color:${wColor}">${windSpeedStr}m/s</span>
      </div>
    </div>`;

  const marker = L.marker([st.lat, st.lng], {
    icon: L.divIcon({ html: labelHtml, className: '', iconSize: null, iconAnchor: [40, 20] }),
    zIndexOffset: 500,
  }).addTo(state.map);

  marker.bindPopup(
    L.popup({ className: 'wx-popup-wrap', closeButton: true, maxWidth: 200 })
     .setContent(_buildPopupHtml(st, d))
  );
  marker._wxData = { st, d };
  state.wxMarkers.push(marker);
}

function _buildPopupHtml(st, d) {
  const icon_str = weatherIcon(d.wcode);
  const tempStr  = d.temp      != null ? Math.round(d.temp)    + '℃'   : '--';
  const windStr  = d.wind      != null ? d.wind.toFixed(1)     + 'm/s' : '--';
  const waveStr  = d.wave      != null ? d.wave.toFixed(1)     + 'm'   : '--';
  const wc       = windColor(d.wind);
  const wLabel   = windLabel(d.wind);
  const wDirTxt  = windDirText(d.winddir);
  const wArrow   = windArrowDeg(d.winddir);

  const fcDefs = [
    {k:0,label:'現在'},{k:1,label:'+1h'},{k:2,label:'+2h'},{k:3,label:'+3h'},
    {k:6,label:'+6h'},{k:12,label:'+12h'},{k:24,label:'+24h'},
  ];
  const fcRows = fcDefs.map(({ k, label }) => {
    const fc    = (d.forecast || {})[k];
    if (!fc) return '';
    const fIcon = weatherIcon(fc.wcode);
    const fWind = fc.wind != null ? fc.wind.toFixed(1) + 'm/s' : '--';
    const active = k === state.forecastOffset
      ? 'style="background:rgba(0,201,167,0.15);border-radius:4px"' : '';
    return `<tr ${active}>
      <td style="padding:2px 6px;color:var(--text-muted);font-size:11px">${label}</td>
      <td style="padding:2px 4px;font-size:13px">${fIcon}</td>
      <td style="padding:2px 6px;font-size:11px;color:var(--sky)">${fWind}</td>
    </tr>`;
  }).join('');

  return `<div class="wx-popup">
    <div class="wx-name">${icon_str} ${st.name}</div>
    <div class="wx-row"><span class="wx-key">気温</span><span class="wx-val">${tempStr}</span></div>
    <div class="wx-wind-block">
      <div class="wind-compass">
        <div class="compass-ring">
          <span class="compass-n">N</span><span class="compass-s">S</span>
          <span class="compass-e">E</span><span class="compass-w">W</span>
          <svg viewBox="0 0 40 40" width="40" height="40" style="position:absolute;top:0;left:0">
            <polygon points="20,4 24,28 20,24 16,28"
              fill="${wc}" transform="rotate(${wArrow},20,20)"/>
          </svg>
        </div>
        <div class="compass-label" style="color:${wc}">${wDirTxt}</div>
      </div>
      <div class="wind-detail">
        <div class="wind-speed" style="color:${wc}">${windStr}</div>
        <div class="wind-badge" style="background:${wc}22;color:${wc};border:1px solid ${wc}55">${wLabel}</div>
        <div class="wx-row" style="margin-top:6px">
          <span class="wx-key">風向角</span>
          <span class="wx-val">${d.winddir != null ? Math.round(d.winddir) + '°' : '--'}</span>
        </div>
      </div>
    </div>
    <div class="wx-divider"></div>
    <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">雨雲予報</div>
    <table style="width:100%;border-collapse:collapse;margin-bottom:6px">${fcRows}</table>
    <div class="wx-divider"></div>
    <div class="wx-wave">${waveStr}</div>
    <div class="wx-wave-label">波高</div>
    <div class="wx-row" style="margin-top:4px">
      <span class="wx-key">波周期</span>
      <span class="wx-val">${d.wavePeriod != null ? d.wavePeriod.toFixed(1) + 's' : '--'}</span>
    </div>
    <div class="wx-row">
      <span class="wx-key">波向</span>
      <span class="wx-val">${d.waveDir != null ? windDirText(d.waveDir) + ' (' + Math.round(d.waveDir) + '°)' : '--'}</span>
    </div>
  </div>`;
}
