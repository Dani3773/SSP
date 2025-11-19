// mapScript.js - inicializa mapa e popula câmeras a partir da API
const DEFAULT_CENTER = [-28.6773, -49.3699];
const DEFAULT_ZOOM = 13;

const map = L.map('map').setView(DEFAULT_CENTER, DEFAULT_ZOOM);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

const cameraIcon = L.icon({
  iconUrl: '../img/camera_png.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const markers = [];
const markersById = new Map();

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

    const camContainer = document.querySelector('.cam');
    if (!camContainer) return;
    camContainer.innerHTML = '';

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
        if (cam && cam.id != null) markersById.set(String(cam.id), marker);
      } catch (e) {
        console.warn('Erro ao adicionar marker:', e);
      }

      // item lateral (um por linha) - sempre exibir um iframe do YouTube (demo) ou thumbnail
      const item = document.createElement('div');
      item.className = 'cam-item';
      item.setAttribute('data-id', cam.id != null ? String(cam.id) : '');

      // prefer explicit demoVideoId from data, else try find by name, else rotate defaults
      const demoId = cam.demoVideoId || findDemoVideoByName(cam.name || cam.location || '') || DEFAULT_DEMO_VIDEOS[i % DEFAULT_DEMO_VIDEOS.length];

      item.innerHTML = `
        <p>${escapeHtml(cam.name || cam.location || 'Câmera')}</p>
        <div class="cam-preview">
          <iframe 
            width="100%" 
            height="250" 
            src="https://www.youtube.com/embed/${demoId}?autoplay=1&mute=1&playsinline=1" 
            title="${escapeHtml(cam.name || 'Câmera')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
          </iframe>
        </div>
        <button class="cam-locate" data-id="${cam.id != null ? String(cam.id) : ''}" data-lat="${lat}" data-lng="${lng}">LOCALIZAÇÃO</button>
      `;
      camContainer.appendChild(item);
    });

    initCameraListInteractions();
    initSearch();
  } catch (err) {
    console.error('Erro ao carregar câmeras:', err);
  }
}

function initCameraListInteractions() {
  const buttons = document.querySelectorAll('.cam .cam-locate');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const lat = parseFloat(btn.getAttribute('data-lat'));
      const lng = parseFloat(btn.getAttribute('data-lng'));

      if (id && markersById.has(id)) {
        const marker = markersById.get(id);
        map.setView(marker.getLatLng(), 16);
        marker.openPopup();
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
    });
  });

  // Expor função global para seleção por id (pode ser chamada de outras partes do app)
  window.selectCameraById = function(id) {
    if (!id) return;
    const key = String(id);
    if (markersById.has(key)) {
      const marker = markersById.get(key);
      map.setView(marker.getLatLng(), 16);
      marker.openPopup();
      return true;
    }
    return false;
  };
}

function initSearch() {
  const inputBusca = document.getElementById('textbusc');
  const camContainer = document.querySelector('.cam');
  if (!inputBusca || !camContainer) return;
  inputBusca.addEventListener('input', () => {
    const termo = inputBusca.value.trim().toLowerCase();
    camContainer.querySelectorAll('.cam-item').forEach((el) => {
      const nome = el.querySelector('p')?.textContent?.toLowerCase() || '';
      el.style.display = nome.includes(termo) ? 'block' : 'none';
    });
  });
}

// iniciar
fetchAndRenderCameras();