// organisms/MapView.js — Leafletマップの初期化と写真ピン管理
import { state }      from '../store/state.js';
import { drawOverlay } from './OverlayCanvas.js';
import { openModal }  from '../molecules/PhotoModal.js';

export function initMap() {
  const BOUNDS = L.latLngBounds(
    L.latLng(25.90, 127.55),
    L.latLng(26.95, 128.40)
  );
  state.map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    maxBounds: BOUNDS,
    maxBoundsViscosity: 1.0,
    minZoom: 10,
    maxZoom: 19,
  });
  state.map.setView([26.212, 127.681], 13);

  // 衛星写真タイル（Esri）
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    { attribution: 'Tiles © Esri', maxZoom: 19 }
  ).addTo(state.map);

  // 地名ラベル（Esri）
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    { attribution: '', maxZoom: 19, opacity: 0.7 }
  ).addTo(state.map);

  state.map.on('click', _onMapClick);
  state.map.on('zoomend moveend', () => {
    if (state.overlayVisible) drawOverlay();
  });
}

export function addPhotoMarker(idx) {
  const p     = state.photoPins[idx];
  if (p.marker) state.map.removeLayer(p.marker);
  const count = p.photos.length;
  const html  = `<div class="photo-marker">${count > 0 ? count : '+'}</div>`;
  const marker = L.marker([p.lat, p.lng], {
    icon: L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 15] }),
    zIndexOffset: 1000,
  }).addTo(state.map);
  marker.on('click', e => { e.originalEvent.stopPropagation(); openModal(idx); });
  p.marker = marker;
}

function _onMapClick(e) {
  const { lat, lng } = e.latlng;
  state.photoPins.push({ id: null, lat, lng, caption: '', photos: [], marker: null });
  const idx = state.photoPins.length - 1;
  addPhotoMarker(idx);
  openModal(idx);
}
