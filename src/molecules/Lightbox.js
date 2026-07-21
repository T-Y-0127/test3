// molecules/Lightbox.js — 写真フルスクリーン表示
export function openLightbox(url) {
  document.getElementById('lightbox-img').src = url;
  document.getElementById('lightbox').classList.add('show');
}
export function closeLightbox() {
  document.getElementById('lightbox').classList.remove('show');
}
