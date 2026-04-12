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
    ctx.fillStyle = 'rgba(9, 10, 10, 0.2)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.34)';

    points.forEach(point => {
      const x = point.x + Math.sin(time / 1200 + point.phase) * 3;
      const y = point.y + Math.cos(time / 1400 + point.phase) * 3;
      const distance = Math.hypot(x - spiderX, y - spiderY);

      if (distance < 150) {
        const alpha = 0.64 - (distance / 150) * 0.28;
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.lineWidth = distance < 70 ? 1.7 : 1.1;
        ctx.beginPath();
        ctx.moveTo(spiderX, spiderY);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  const drawSpider = time => {
    ctx.save();
    ctx.translate(spiderX, spiderY);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 3;

    const pulse = Math.sin(time / 280) * 0.8;
    const ripple = Math.cos(time / 360) * 0.7;
    const liquid = ctx.createRadialGradient(-3, -5, 1, 0, 2, 15);
    liquid.addColorStop(0, 'rgba(48, 50, 50, 0.98)');
    liquid.addColorStop(0.38, 'rgba(14, 15, 15, 0.99)');
    liquid.addColorStop(1, 'rgba(0, 0, 0, 1)');

    ctx.fillStyle = liquid;
    ctx.beginPath();
    ctx.moveTo(0, -15 - pulse);
    ctx.bezierCurveTo(9 + ripple, -12, 12, -3, 10, 6);
    ctx.bezierCurveTo(8, 15 + pulse, 1, 19, -5, 15);
    ctx.bezierCurveTo(-13, 11, -12, 0, -9, -7);
    ctx.bezierCurveTo(-6, -12, -3, -15, 0, -15 - pulse);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.beginPath();
    ctx.ellipse(-4, -7, 1.7, 4.2, 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.68)';
    ctx.beginPath();
    ctx.ellipse(2, 16 + pulse * 0.3, 2.8, 4.2, -0.15, 0, Math.PI * 2);
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
