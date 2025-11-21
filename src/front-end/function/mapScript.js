// mapScript.js - inicializa mapa e popula câmeras a partir da API
const DEFAULT_CENTER = [-28.6773, -49.3699];
const DEFAULT_ZOOM = 13;

let map = null; // inicializado após DOM estar disponível

function initLeafletMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) {
    console.warn('[mapScript] elemento #map não encontrado — aguardando DOM');
    return;
  }
  if (map) return; // já inicializado
  map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
}

const cameraIcon = L.icon({
  iconUrl: '../img/camera_png.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const markers = [];
const markersById = new Map();
// Se true: cria iframes embutidos imediatamente (autoplay muted). Se false: usa miniatura + play.
const AUTO_CREATE_IFRAMES = true;

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (s) => ({
    '&': '&amp;','<': '&lt;','>': '&gt;','"': '&quot;',"'": '&#39;'
  }[s]));
}

async function fetchAndRenderCameras() {
  try {
    const res = await fetch('/api/cameras');
    if (!res.ok) throw new Error('Erro ao buscar câmeras');
    const cameras = await res.json();

    const camContainer = document.querySelector('.map-cam');
    // se existir, limpar a seção para adicionar câmeras dinâmicas
    if (camContainer) camContainer.innerHTML = '';

    const DEFAULT_DEMO_VIDEOS = ['qmE7U1YZPQA','57Xf43Pug5k','z545k7Tcb5o'];

    function findDemoVideoByName(name) {
      if (!name) return null;
      const lower = name.toLowerCase();
      if (lower.includes('universitaria')) return 'qmE7U1YZPQA';
      if (lower.includes('perassoli') || lower.includes('leone')) return '57Xf43Pug5k';
      if (lower.includes('lucca') || lower.includes('jorge')) return 'z545k7Tcb5o';
      if (lower.includes('parque')) return 'z545k7Tcb5o';
      return null;
    }

    cameras.forEach((cam, i) => {
      const lat = parseFloat(cam.latitude || cam.lat || 0) || 0;
      const lng = parseFloat(cam.longitude || cam.lng || 0) || 0;

      // criar marker
      try {
        const marker = L.marker([lat, lng], { icon: cameraIcon }).addTo(map);
        const popup = `
          <strong>${escapeHtml(cam.name || 'Câmera')}</strong><br>
          <small>${escapeHtml(cam.location || '')}</small>
          <p style="margin-top:8px">Status: ${escapeHtml(cam.status || 'desconhecido')}</p>
        `;
        marker.bindPopup(popup);
        markers.push({ marker, cam });
        console.log('[mapScript] created marker for camera', cam && cam.id != null ? String(cam.id) : '<no-id>');
        if (cam && cam.id != null) markersById.set(String(cam.id), marker);
      } catch (e) {
        console.warn('Erro ao adicionar marker:', e);
      }
      // Se houver um container lateral (.map-cam), também renderizar o item na lista
        if (camContainer) {
        // item lateral (um por linha) - sempre exibir um iframe do YouTube (demo) ou thumbnail
        const item = document.createElement('div');
        item.className = 'cam-item';
        item.setAttribute('data-id', cam.id != null ? String(cam.id) : '');

        // prefer explicit demoVideoId from data, else try find by name, else rotate defaults
        const demoId = cam.demoVideoId || findDemoVideoByName(cam.name || cam.location || '') || DEFAULT_DEMO_VIDEOS[i % DEFAULT_DEMO_VIDEOS.length];

        if (AUTO_CREATE_IFRAMES) {
          item.innerHTML = `
            <p class="cam-title">${escapeHtml(cam.name || cam.location || 'Câmera')}</p>
            <div class="cam-preview">
              <iframe 
                width="100%" 
                height="250" 
                src="https://www.youtube.com/embed/${demoId}?autoplay=1&mute=1&playsinline=1&rel=0&controls=1" 
                title="${escapeHtml(cam.name || 'Câmera')}" 
                frameborder="0" 
                allow="autoplay; encrypted-media; picture-in-picture" 
                referrerpolicy="strict-origin-when-cross-origin" 
                allowfullscreen playsinline>
              </iframe>
            </div>
            <button class="cam-locate" data-id="${cam.id != null ? String(cam.id) : ''}" data-lat="${lat}" data-lng="${lng}">LOCALIZAÇÃO</button>
          `;
        } else {
          const thumbUrl = `https://i.ytimg.com/vi/${demoId}/hqdefault.jpg`;
          item.innerHTML = `
            <p class="cam-title">${escapeHtml(cam.name || cam.location || 'Câmera')}</p>
            <div class="cam-preview" data-demo-id="${demoId}">
              <div class="video-thumb" style="background-image:url('${thumbUrl}')">
                <button class="play-video" data-demo-id="${demoId}" aria-label="Reproduzir vídeo">▶</button>
              </div>
            </div>
            <button class="cam-locate" data-id="${cam.id != null ? String(cam.id) : ''}" data-lat="${lat}" data-lng="${lng}">LOCALIZAÇÃO</button>
          `;
        }
        camContainer.appendChild(item);
        console.log('[mapScript] render item', cam && cam.id != null ? String(cam.id) : '<no-id>', 'demoId=', demoId);
      }
    });
    console.log('[mapScript] render finished, appended items to .cam');
    // remover/atualizar indicador visual
    if (statusEl) {
      statusEl.textContent = `Câmeras carregadas: ${cameras.length}`;
      setTimeout(() => statusEl.remove(), 2500);
    }
    initCameraListInteractions();
    initSearch();
    if (!AUTO_CREATE_IFRAMES) initPlayButtons();
  } catch (err) {
    console.error('Erro ao carregar câmeras:', err);
    const camContainer = document.querySelector('.cam');
    if (camContainer) {
      camContainer.innerHTML = `<div style="color:#ff6b6b;padding:8px">Erro ao carregar câmeras: ${escapeHtml(err && err.message)}</div>`;
    }
  }
}

function initPlayButtons() {
  const plays = document.querySelectorAll('.map-cam .play-video');
  plays.forEach(btn => {
    // prevent double-binding
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', (e) => {
      const demoId = btn.getAttribute('data-demo-id');
      if (!demoId) return;
      const preview = btn.closest('.cam-preview');
      if (!preview) return;
      const iframe = document.createElement('iframe');
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '250');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      iframe.setAttribute('playsinline', '');
      iframe.src = `https://www.youtube.com/embed/${demoId}?autoplay=1&mute=1&playsinline=1&rel=0&controls=1`;
      preview.innerHTML = '';
      preview.appendChild(iframe);
    });
  });
}

function initCameraListInteractions() {
  const buttons = document.querySelectorAll('.map-cam .cam-locate');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const lat = parseFloat(btn.getAttribute('data-lat'));
      const lng = parseFloat(btn.getAttribute('data-lng'));

      if (id && markersById.has(id)) {
        const marker = markersById.get(id);
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();
        // highlight corresponding list item
        highlightListItem(id);
        return;
      }

      if (!isFinite(lat) || !isFinite(lng)) return;
      map.setView([lat, lng], 16);

      // abrir marker mais próximo (fallback)
      let closest = null;
      let minDist = Infinity;
      markers.forEach(({ marker }) => {
        const p = marker.getLatLng();
        const dx = p.lat - lat;
        const dy = p.lng - lng;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < minDist) { minDist = dist; closest = marker; }
      });
      if (closest) closest.openPopup();
      // highlight nearest list item as fallback
      const nearestCam = markers.find(m => m.marker === closest);
      if (nearestCam && nearestCam.cam && nearestCam.cam.id != null) highlightListItem(String(nearestCam.cam.id));
    });
  });

  // Expor função global para seleção por id (pode ser chamada de outras partes do app)
  window.selectCameraById = function(id) {
    if (!id) return;
    const key = String(id);
    console.log('[mapScript] selectCameraById', key);
    if (markersById.has(key)) {
      const marker = markersById.get(key);
      map.setView(marker.getLatLng(), 16);
      marker.openPopup();
      highlightListItem(key);
      return true;
    }
    return false;
  };
}
function highlightListItem(id) {
  const camContainer = document.querySelector('.map-cam');
  if (!camContainer) return;
  camContainer.querySelectorAll('.cam-item').forEach(el => el.classList.remove('active'));
  const item = camContainer.querySelector(`.cam-item[data-id="${id}"]`);
  if (item) {
    item.classList.add('active');
    // scroll into view
    item.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function initSearch() {
  const inputBusca = document.getElementById('textbusc');
    const camContainer = document.querySelector('.map-cam');
      console.log('[mapScript] render finished, appended items to .map-cam');
    if (!inputBusca || !camContainer) return;
  inputBusca.addEventListener('input', () => {
    const termo = inputBusca.value.trim().toLowerCase();
    camContainer.querySelectorAll('.cam-item').forEach((el) => {
      const nome = el.querySelector('p')?.textContent?.toLowerCase() || '';
      el.style.display = nome.includes(termo) ? 'block' : 'none';
    });
  });
}

// iniciar quando DOM pronto
document.addEventListener('DOMContentLoaded', () => {
  try { initLeafletMap(); } catch (e) { console.error('[mapScript] erro initLeafletMap', e); }
  fetchAndRenderCameras();
});