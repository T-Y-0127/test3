// store/state.js — アプリ全体の状態を一元管理
export const state = {
  map:             null,
  currentLayer:    'pin',
  overlayVisible:  true,
  windVisible:     false,
  forecastOffset:  0,
  wxMarkersVisible: true,
  wxMarkers:       [],
  photoPins:       [],
  activePinIdx:    null,
  useSupabase:     false,
  supabaseClient:  null,
};
