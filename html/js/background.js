export function initFlightBackground(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const sky = document.createElement('div');
  sky.classList.add('sky');
  container.appendChild(sky);

  const plane = document.createElement('div');
  plane.classList.add('plane');
  sky.appendChild(plane);

  const cloudCount = Math.floor(Math.random() * 6) + 3;
  for (let i = 0; i < cloudCount; i++) {
    const cloud = document.createElement('div');
    cloud.classList.add('cloud');
    cloud.style.top = Math.random() * 80 + 'vh';

    const scale = 0.5 + Math.random() * 1.5;
    cloud.style.width = (100 * scale) + 'px';
    cloud.style.height = (60 * scale) + 'px';

    const speed = 30 + Math.random() * 40;
    cloud.style.animationDuration = speed + 's';
    cloud.style.animationDelay = (-1 * Math.random() * speed) + 's';

    sky.appendChild(cloud);
  }
}