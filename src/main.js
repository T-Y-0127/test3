// main.js — エントリーポイント
import { initMap }      from './organisms/MapView.js';
import { fetchWeather } from './organisms/WeatherService.js';
import { loadPhotoPins } from './organisms/PhotoStore.js';
import { setStatus }    from './atoms/StatusBar.js';
import { closeModal, handleFileSelect } from './molecules/PhotoModal.js';
import { closeLightbox } from './molecules/Lightbox.js';
import { deletePin }    from './organisms/PhotoStore.js';
import { state }        from './store/state.js';

// Header の各関数をグローバルに公開（HTML onclick 用）
import './organisms/Header.js';

// ── 起動 ──────────────────────────────────────────────
function startApp() {
  if (typeof L === 'undefined') {
    console.warn('Leaflet not loaded yet, retrying...');
    setTimeout(startApp, 300);
    return;
  }
  if (state.map) return; // 二重初期化防止

  initMap();
  setTimeout(() => {
    if (state.map) state.map.invalidateSize(true);
    fetchWeather();
    if (state.useSupabase) loadPhotoPins();
  }, 300);
}

// ── イベント登録 ─────────────────────────────────────
document.getElementById('file-input').addEventListener('change', async function () {
  const files = Array.from(this.files);
  if (!files.length) return;
  this.value = '';
  await handleFileSelect(files);
});

document.getElementById('modal-overlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// グローバル公開（HTML onclick 用）
window.closeModal    = closeModal;
window.closeLightbox = closeLightbox;
window.deletePin     = async () => {
  const ok = await deletePin(state.activePinIdx);
  if (ok) closeModal();
};

// ── ページ読み込み完了後に起動 ────────────────────────
window.addEventListener('load', () => {
  requestAnimationFrame(() => requestAnimationFrame(startApp));
});
