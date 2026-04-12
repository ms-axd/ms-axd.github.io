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

    targetX = width * 0.5;
    targetY = height * 0.48;
    spiderX = targetX;
    spiderY = targetY;
    resetPoints();
  };

  const drawWeb = time => {
    const centerX = width * 0.5;
    const centerY = height * 0.46;

    ctx.strokeStyle = 'rgba(27, 37, 44, 0.1)';
    ctx.lineWidth = 1;

    for (let ring = 1; ring <= 7; ring += 1) {
      ctx.beginPath();

      for (let ray = 0; ray <= 22; ray += 1) {
        const angle = (Math.PI * 2 * ray) / 22;
        const wobble = Math.sin(time / 900 + ring + ray) * 2;
        const radiusX = ring * width * 0.043 + wobble;
        const radiusY = ring * height * 0.052 + wobble;
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

    for (let ray = 0; ray < 22; ray += 1) {
      const angle = (Math.PI * 2 * ray) / 22;

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
    ctx.fillStyle = 'rgba(27, 37, 44, 0.16)';
    ctx.strokeStyle = 'rgba(8, 10, 12, 0.28)';

    points.forEach(point => {
      const x = point.x + Math.sin(time / 1200 + point.phase) * 3;
      const y = point.y + Math.cos(time / 1400 + point.phase) * 3;
      const distance = Math.hypot(x - spiderX, y - spiderY);

      if (distance < 150) {
        const alpha = 0.5 - (distance / 150) * 0.24;
        ctx.strokeStyle = `rgba(8, 10, 12, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(spiderX, spiderY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpider = time => {
    ctx.save();
    ctx.translate(spiderX, spiderY);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.32)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    const pulse = Math.sin(time / 260) * 0.9;
    const liquid = ctx.createRadialGradient(-3, -4, 1, 0, 2, 14);
    liquid.addColorStop(0, 'rgba(55, 58, 58, 0.98)');
    liquid.addColorStop(0.45, 'rgba(15, 17, 17, 0.99)');
    liquid.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = liquid;
    ctx.beginPath();
    ctx.moveTo(0, -13 - pulse);
    ctx.bezierCurveTo(8 + pulse, -8, 10, 2, 5, 10 + pulse);
    ctx.bezierCurveTo(2, 15, -4, 15, -7, 9);
    ctx.bezierCurveTo(-11, 1, -8, -8, 0, -13 - pulse);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.beginPath();
    ctx.ellipse(-3, -5, 2, 4, 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.beginPath();
    ctx.ellipse(0, 11 + pulse * 0.4, 3.2, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(-5, 16, 1.8, 2.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const render = time => {
    spiderX += (targetX - spiderX) * 0.012;
    spiderY += (targetY - spiderY) * 0.012;

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
    targetX = width * 0.5;
    targetY = height * 0.48;
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(render);
});
