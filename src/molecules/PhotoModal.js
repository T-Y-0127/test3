// molecules/PhotoModal.js — 写真投稿・閲覧モーダル
import { state }                          from '../store/state.js';
import { openLightbox }                   from './Lightbox.js';
import { uploadFile, savePinToSupabase }  from '../organisms/PhotoStore.js';
import { addPhotoMarker }                 from '../organisms/MapView.js';

export function openModal(idx) {
  state.activePinIdx = idx;
  const p = state.photoPins[idx];
  document.getElementById('modal-title').textContent  = p.id ? 'スポット' : '新しいスポット';
  document.getElementById('modal-coord').textContent  = `📍 ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`;
  document.getElementById('modal-delete').style.display = p.id ? '' : 'none';
  renderModalGrid();
  document.getElementById('modal-overlay').classList.add('show');
}

export function closeModal() {
  if (state.activePinIdx !== null) {
    const p = state.photoPins[state.activePinIdx];
    if (!p.id && p.photos.length === 0) {
      if (p.marker) state.map.removeLayer(p.marker);
      state.photoPins.splice(state.activePinIdx, 1);
    }
  }
  document.getElementById('modal-overlay').classList.remove('show');
  state.activePinIdx = null;
}

export function renderModalGrid() {
  const p    = state.photoPins[state.activePinIdx];
  const grid = document.getElementById('modal-grid');
  grid.innerHTML = '';

  if (p.caption) {
    const div = document.createElement('div');
    div.className = 'modal-caption-existing';
    div.style.gridColumn = '1 / -1';
    div.textContent = p.caption;
    grid.appendChild(div);
  }

  p.photos.forEach(url => {
    const img = document.createElement('img');
    img.className = 'modal-thumb';
    img.src = url;
    img.onclick = () => openLightbox(url);
    grid.appendChild(img);
  });

  if (p.photos.length < 9) {
    if (!p.caption) {
      const ta = document.createElement('textarea');
      ta.id = 'modal-caption-input';
      ta.rows = 2;
      ta.placeholder = 'コメントを入力（任意）';
      ta.style.gridColumn = '1 / -1';
      grid.insertBefore(ta, grid.firstChild);
    }
    const addDiv = document.createElement('div');
    addDiv.className = 'modal-add';
    addDiv.innerHTML = `+<span>写真追加</span>`;
    addDiv.onclick = () => document.getElementById('file-input').click();
    grid.appendChild(addDiv);
  }
}

export async function handleFileSelect(files) {
  const p         = state.photoPins[state.activePinIdx];
  const captionEl = document.getElementById('modal-caption-input');
  const caption   = captionEl ? captionEl.value.trim() : p.caption;

  const grid = document.getElementById('modal-grid');
  const loading = document.createElement('div');
  loading.className = 'modal-uploading';
  loading.textContent = 'アップロード中...';
  loading.style.gridColumn = '1 / -1';
  grid.appendChild(loading);

  try {
    const urls = await Promise.all(files.map(f => uploadFile(f)));
    p.photos.push(...urls);
    p.caption = caption;
    if (state.useSupabase) await savePinToSupabase(state.activePinIdx);
    addPhotoMarker(state.activePinIdx);
    renderModalGrid();
  } catch (e) {
    loading.textContent = 'エラー: ' + e.message;
  }
}
