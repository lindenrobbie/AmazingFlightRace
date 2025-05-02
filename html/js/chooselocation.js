// map.js
fetch('http://127.0.0.1:3000/coordinates')
  .then(response => response.json())
  .then(cities => {
    console.log("Loaded cities:", cities);
    const map = L.map('map', { zoomControl: false });

    const markers = cities.map(city =>
      L.marker([city.lat, city.lon])
        .addTo(map)
        .bindPopup(city.name)
    );

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap & CartoDB',
      maxZoom: 10
    }).addTo(map);

    const group = L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.3));
  })
  .catch(err => console.error("Error loading cities:", err));