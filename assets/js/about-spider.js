document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('[data-spider-window]');

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const wrapper = canvas.closest('.about-spider-window');
  const points = [];

  let width = 0;
  let height = 0;
  let targetX = 0;
  let targetY = 0;
  let spiderX = 0;
  let spiderY = 0;

  const resetPoints = () => {
    points.length = 0;

    for (let i = 0; i < 48; i += 1) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        phase: Math.random() * Math.PI * 2,
      });
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    targetX = width * 0.62;
    targetY = height * 0.46;
    spiderX = targetX;
    spiderY = targetY;
    resetPoints();
  };

  const drawWeb = time => {
    const centerX = width * 0.52;
    const centerY = height * 0.48;

    ctx.strokeStyle = 'rgba(36, 91, 55, 0.13)';
    ctx.lineWidth = 1;

    for (let ring = 1; ring <= 5; ring += 1) {
      ctx.beginPath();

      for (let ray = 0; ray <= 18; ray += 1) {
        const angle = (Math.PI * 2 * ray) / 18;
        const wobble = Math.sin(time / 900 + ring + ray) * 2;
        const radiusX = ring * width * 0.065 + wobble;
        const radiusY = ring * height * 0.075 + wobble;
        const x = centerX + Math.cos(angle) * radiusX;
        const y = centerY + Math.sin(angle) * radiusY;

        if (ray === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    for (let ray = 0; ray < 18; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 18;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * width * 0.38,
        centerY + Math.sin(angle) * height * 0.44
      );
      ctx.stroke();
    }
  };

  const drawParticles = time => {
    ctx.fillStyle = 'rgba(23, 67, 38, 0.22)';
    ctx.strokeStyle = 'rgba(36, 91, 55, 0.12)';

    points.forEach(point => {
      const x = point.x + Math.sin(time / 1200 + point.phase) * 3;
      const y = point.y + Math.cos(time / 1400 + point.phase) * 3;
      const distance = Math.hypot(x - spiderX, y - spiderY);

      if (distance < 150) {
        ctx.beginPath();
        ctx.moveTo(spiderX, spiderY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpider = time => {
    ctx.save();
    ctx.translate(spiderX, spiderY);

    ctx.strokeStyle = 'rgba(18, 53, 31, 0.78)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    for (let i = 0; i < 8; i += 1) {
      const side = i < 4 ? -1 : 1;
      const row = i % 4;
      const y = row * 4 - 7;
      const step = Math.sin(time / 140 + row) * 2;

      ctx.beginPath();
      ctx.moveTo(side * 4, y);
      ctx.lineTo(side * (13 + row), y + step + row);
      ctx.lineTo(side * (22 + row), y + step - 4);
      ctx.stroke();
    }

    ctx.fillStyle = 'rgba(99, 193, 116, 0.94)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(18, 53, 31, 0.86)';
    ctx.beginPath();
    ctx.arc(0, -7, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const render = time => {
    spiderX += (targetX - spiderX) * 0.08;
    spiderY += (targetY - spiderY) * 0.08;

    ctx.clearRect(0, 0, width, height);
    drawWeb(time);
    drawParticles(time);
    drawSpider(time);

    requestAnimationFrame(render);
  };

  wrapper.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  });

  wrapper.addEventListener('pointerleave', () => {
    targetX = width * 0.62;
    targetY = height * 0.46;
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(render);
});
