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

L.marker([-28.6775, -49.3698], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Centro de Criciúma</b><br>
    <iframe 
      width="300" 
      height="200" 
      src="https://www.youtube.com/embed/qmE7U1YZPQA" 
      title="Santa Monica Beach Cam powered by EXPLORE.org" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen>
    </iframe>
  `);


