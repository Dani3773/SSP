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

  L.marker([-28.7008, -49.4102], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Avenida Universitária</b><br>
    <iframe 
      width="240" 
      height="180" 
      src="https://www.youtube.com/embed/qmE7U1YZPQA?autoplay=1&mute=1" 
      title="" 
      frameborder="0" 
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  `);

  L.marker([-28.6837, -49.3689], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Rua Leone Perassoli</b><br>
    <iframe 
      width="240" 
      height="180" 
      src="https://www.youtube.com/embed/57Xf43Pug5k?autoplay=1&mute=1" 
      title="" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen>
    </iframe>
  `);

  L.marker([-28.6874, -49.3334], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Av. Jorge Elias de Lucca</b><br>
    <iframe 
      width="240" 
      height="180" 
      src="https://www.youtube.com/embed/z545k7Tcb5o?autoplay=1&mute=1" 
      title="" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      referrerpolicy="strict-origin-when-cross-origin" 
      allowfullscreen>
    </iframe>
  `);