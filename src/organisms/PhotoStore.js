// organisms/PhotoStore.js — 写真のアップロード・DB保存
import { state }   from '../store/state.js';
import { setStatus } from '../atoms/StatusBar.js';
import { addPhotoMarker } from './MapView.js';

export async function loadPhotoPins() {
  if (!state.useSupabase) return;
  setStatus('写真スポット読み込み中...');
  try {
    const { data, error } = await state.supabaseClient
      .from('photo_pins').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    data.forEach(row => {
      state.photoPins.push({
        id: row.id, lat: row.lat, lng: row.lng,
        caption: row.caption || '', photos: row.photos || [], marker: null,
      });
      addPhotoMarker(state.photoPins.length - 1);
    });
    setStatus(`写真スポット ${data.length} 件読み込み`, 3000);
  } catch (e) {
    setStatus('写真読み込みエラー: ' + e.message, 4000);
  }
}

export async function uploadFile(file) {
  if (!state.useSupabase) {
    // デモモード: base64
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload  = e => res(e.target.result);
      r.onerror = () => rej(new Error('読み込み失敗'));
      r.readAsDataURL(file);
    });
  }
  const path = `photos/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const { error } = await state.supabaseClient.storage.from('okinawa-map').upload(path, file);
  if (error) throw error;
  const { data } = state.supabaseClient.storage.from('okinawa-map').getPublicUrl(path);
  return data.publicUrl;
}

export async function savePinToSupabase(idx) {
  const p = state.photoPins[idx];
  if (p.id) {
    const { error } = await state.supabaseClient
      .from('photo_pins').update({ photos: p.photos, caption: p.caption }).eq('id', p.id);
    if (error) throw error;
  } else {
    const { data, error } = await state.supabaseClient
      .from('photo_pins').insert({ lat: p.lat, lng: p.lng, photos: p.photos, caption: p.caption })
      .select().single();
    if (error) throw error;
    p.id = data.id;
  }
}

export async function deletePin(idx) {
  if (!confirm('このスポットを削除しますか？')) return false;
  const p = state.photoPins[idx];
  if (state.useSupabase && p.id) {
    await state.supabaseClient.from('photo_pins').delete().eq('id', p.id);
  }
  state.map.removeLayer(p.marker);
  state.photoPins.splice(idx, 1);
  return true;
}
