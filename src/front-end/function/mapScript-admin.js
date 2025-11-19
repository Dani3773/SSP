// Admin Mode - Câmeras sem blur (centralizado em Criciúma)
const map = L.map('map').setView([-28.6773, -49.3699], 13);

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

// Versões dos vídeos SEM BLUR (admin)
const adminVideos = {
  universitaria: 'qmE7U1YZPQA', // Substitua pelo ID do vídeo sem blur quando disponível
  perassoli: '57Xf43Pug5k',     // Substitua pelo ID do vídeo sem blur quando disponível
  lucca: 'z545k7Tcb5o'          // Substitua pelo ID do vídeo sem blur quando disponível
};

L.marker([-28.7008, -49.4102], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <div style="min-width: 240px;">
      <b>Câmera - Avenida Universitária</b><br>
      <span style="color: #10b981; font-weight: bold; font-size: 12px;">
        <i class="fas fa-unlock"></i> MODO ADMIN - SEM BLUR
      </span><br>
      <iframe 
        width="240" 
        height="180" 
        src="https://www.youtube.com/embed/${adminVideos.universitaria}?autoplay=1&mute=1" 
        title="" 
        frameborder="0" 
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    </div>
  `);

L.marker([-28.6837, -49.3689], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <div style="min-width: 240px;">
      <b>Câmera - Rua Leone Perassoli</b><br>
      <span style="color: #10b981; font-weight: bold; font-size: 12px;">
        <i class="fas fa-unlock"></i> MODO ADMIN - SEM BLUR
      </span><br>
      <iframe 
        width="240" 
        height="180" 
        src="https://www.youtube.com/embed/${adminVideos.perassoli}?autoplay=1&mute=1" 
        title="" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen>
      </iframe>
    </div>
  `);

L.marker([-28.6874, -49.3334], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <div style="min-width: 240px;">
      <b>Câmera - Av. Jorge Elias de Lucca</b><br>
      <span style="color: #10b981; font-weight: bold; font-size: 12px;">
        <i class="fas fa-unlock"></i> MODO ADMIN - SEM BLUR
      </span><br>
      <iframe 
        width="240" 
        height="180" 
        src="https://www.youtube.com/embed/${adminVideos.lucca}?autoplay=1&mute=1" 
        title="" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" 
        allowfullscreen>
      </iframe>
    </div>
  `);

// Busca de câmeras
const inputBusca = document.getElementById("textbusc");
const cameras = document.querySelectorAll(".cam > div");

inputBusca.addEventListener("keyup", () => {
  const termo = inputBusca.value.toLowerCase(); 

  cameras.forEach((cam) => {
    const nomeRua = cam.querySelector("p").textContent.toLowerCase();
    if (nomeRua.includes(termo)) {
      cam.style.display = "block";
    } else {
      cam.style.display = "none";
    }
  });
});

// Botões de localização
const botoesLocalizacao = document.querySelectorAll(".cam button");

botoesLocalizacao.forEach((botao) => {
  botao.addEventListener("click", () => {
    const lat = parseFloat(botao.getAttribute("data-lat"));
    const lng = parseFloat(botao.getAttribute("data-lng"));
    map.setView([lat, lng], 16);

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const markerLatLng = layer.getLatLng();
        if (markerLatLng.lat === lat && markerLatLng.lng === lng) {
          layer.openPopup();
        }
      }
    });
  });
});

// ============================================
// FORMULÁRIO DE DENÚNCIA INTERNA
// ============================================

// Função para limpar o formulário
function limparFormDenuncia() {
  document.getElementById('form-denuncia-interna').reset();
}

// Função para enviar denúncia
document.getElementById('form-denuncia-interna')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const token = localStorage.getItem('ssp-token');
  if (!token) {
    alert('Sessão expirada. Faça login novamente.');
    window.location.href = '../index.html#openComite';
    return;
  }

  // Coletar dados do formulário
  const denunciaData = {
    titulo: document.getElementById('denuncia-titulo').value,
    tipo: document.getElementById('denuncia-tipo').value,
    camera: document.getElementById('denuncia-camera').value,
    data: document.getElementById('denuncia-data').value,
    hora: document.getElementById('denuncia-hora').value,
    localizacao: document.getElementById('denuncia-localizacao').value,
    descricao: document.getElementById('denuncia-descricao').value,
    suspeitos: document.getElementById('denuncia-suspeitos').value,
    prioridade: document.getElementById('denuncia-prioridade').value,
    urgente: document.getElementById('denuncia-urgente').checked,
    origem: 'admin-cameras',
    timestamp: new Date().toISOString()
  };

  try {
    const response = await fetch('http://localhost:3000/api/denuncias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(denunciaData)
    });

    if (response.ok) {
      alert('Denúncia registrada com sucesso!');
      limparFormDenuncia();
    } else {
      const error = await response.json();
      alert('Erro ao registrar denúncia: ' + (error.message || 'Erro desconhecido'));
    }
  } catch (error) {
    console.error('Erro:', error);
    alert('Erro ao conectar com o servidor');
  }
});

// Definir data e hora atual como padrão
window.addEventListener('DOMContentLoaded', function() {
  const hoje = new Date();
  const dataInput = document.getElementById('denuncia-data');
  const horaInput = document.getElementById('denuncia-hora');
  
  if (dataInput) {
    dataInput.value = hoje.toISOString().split('T')[0];
  }
  
  if (horaInput) {
    const horas = String(hoje.getHours()).padStart(2, '0');
    const minutos = String(hoje.getMinutes()).padStart(2, '0');
    horaInput.value = `${horas}:${minutos}`;
  }
});
