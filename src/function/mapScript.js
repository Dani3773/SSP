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

L.marker([-28.7069, -49.4166], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - AM - Master Hall</b><br>
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

  L.marker([-28.7008, -49.4102], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - CEDUP</b><br>
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

  L.marker([-28.6837, -49.3689], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Estádio Heriberto Hulse</b><br>
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

  L.marker([-28.7025, -49.4050], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Colégio SATC</b><br>
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

  L.marker([-28.7012, -49.4092], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - UNESC - Universidade do Extremo Sul Catarinense</b><br>
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

  L.marker([-28.6874, -49.3334], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Nações Shopping</b><br>
      <iframe width="300" height="300" src="https://www.youtube.com/embed/z545k7Tcb5o" title="Périphérique Nord - Porte de la Pape" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>" 
  `);

  L.marker([-28.6868, -49.3493], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Unimed</b><br>
    <iframe 
      width="300" 
      height="200" 
      src=""https://www.youtube.com/embed/4y5jzMe1O5g" 
      title="Santa Monica Beach Cam powered by EXPLORE.org" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
      allowfullscreen>
    </iframe>
  `);

  L.marker([-28.7035, -49.3602], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Parque Centenário</b><br>
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

  L.marker([-28.6888, -49.3801], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Prefeitura Municipal de Criciúma</b><br>
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

  L.marker([-28.6904, -49.3906], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - HAVAN</b><br>
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

  L.marker([-28.6751, -49.3692], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - Praça do Congresso</b><br>
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

  L.marker([-28.6789, -49.3315], { icon: cameraIcon })
  .addTo(map)
  .bindPopup(`
    <b>Câmera - IFSC</b><br>
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