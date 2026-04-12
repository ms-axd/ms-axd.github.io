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

    for (let i = 0; i < 150; i += 1) {
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

    targetX = width * 0.5;
    targetY = height * 0.48;
    spiderX = targetX;
    spiderY = targetY;
    resetPoints();
  };

  const drawWeb = () => {
    const centerX = width * 0.5;
    const centerY = height * 0.46;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;

    for (let ring = 1; ring <= 6; ring += 1) {
      ctx.beginPath();

      for (let ray = 0; ray <= 20; ray += 1) {
        const angle = (Math.PI * 2 * ray) / 20;
        const radiusX = ring * width * 0.045;
        const radiusY = ring * height * 0.052;
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

    for (let ray = 0; ray < 20; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 20;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * width * 0.4,
        centerY + Math.sin(angle) * height * 0.42
      );
      ctx.stroke();
    }
  };

  const drawParticles = time => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';

    points.forEach(point => {
      const x = point.x + Math.sin(time / 1200 + point.phase) * 2.4;
      const y = point.y + Math.cos(time / 1400 + point.phase) * 2.4;
      const distance = Math.hypot(x - spiderX, y - spiderY);

      if (distance < 145) {
        const alpha = 0.62 - (distance / 145) * 0.28;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.lineWidth = distance < 70 ? 1.2 : 0.8;
        ctx.beginPath();
        ctx.moveTo(spiderX, spiderY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpider = time => {
    ctx.save();
    ctx.translate(spiderX, spiderY);

    const legShift = Math.sin(time / 180) * 0.7;

    ctx.shadowColor = 'rgba(255, 255, 255, 0.24)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(235, 235, 235, 0.82)';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';

    const legs = [
      [-3, -6, -9, -10, -15, -13],
      [-3, -2, -11, -4, -18, -3],
      [-3, 2, -10, 5, -15, 10],
      [-2, 5, -7, 11, -10, 17],
      [3, -6, 9, -10, 15, -13],
      [3, -2, 11, -4, 18, -3],
      [3, 2, 10, 5, 15, 10],
      [2, 5, 7, 11, 10, 17],
    ];

    legs.forEach((leg, index) => {
      const sideShift = index % 2 === 0 ? legShift : -legShift;
      ctx.beginPath();
      ctx.moveTo(leg[0], leg[1]);
      ctx.quadraticCurveTo(leg[2], leg[3] + sideShift, leg[4], leg[5]);
      ctx.stroke();
    });

    ctx.fillStyle = 'rgba(242, 242, 242, 0.9)';
    ctx.beginPath();
    ctx.ellipse(0, 2, 4.2, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(248, 248, 248, 0.88)';
    ctx.beginPath();
    ctx.ellipse(0, -4, 3.1, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const render = time => {
    spiderX += (targetX - spiderX) * 0.012;
    spiderY += (targetY - spiderY) * 0.012;

    ctx.clearRect(0, 0, width, height);
    drawWeb();
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
    targetX = width * 0.5;
    targetY = height * 0.48;
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(render);
});
