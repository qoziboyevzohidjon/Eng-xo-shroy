(() => {
  const canvas = document.querySelector('.mouse-trail');
  if (!canvas || !window.matchMedia('(hover: hover) and (pointer: fine)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const context = canvas.getContext('2d');
  if (!context) return;
  const points = Array.from({ length: 16 }, () => ({ x: -100, y: -100 }));
  const pointer = { x: -100, y: -100, active: false, interactive: false };
  let width = 0;
  let height = 0;
  let pixelRatio = 1;

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }
  function move(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    pointer.interactive = Boolean(event.target.closest('button, a, input, select, [role="button"], .post-media'));
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    if (pointer.active) {
      points[0].x += (pointer.x - points[0].x) * .68;
      points[0].y += (pointer.y - points[0].y) * .68;
      for (let index = 1; index < points.length; index += 1) {
        points[index].x += (points[index - 1].x - points[index].x) * .43;
        points[index].y += (points[index - 1].y - points[index].y) * .43;
      }
      points.forEach((point, index) => {
        const progress = 1 - index / points.length;
        const radius = (pointer.interactive ? 4.4 : 3.2) * progress;
        context.beginPath();
        context.fillStyle = `rgba(${pointer.interactive ? '226,196,124' : '201,162,75'}, ${progress * .5})`;
        context.arc(point.x, point.y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  resize();
  requestAnimationFrame(draw);
})();