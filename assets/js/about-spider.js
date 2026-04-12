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

    ctx.strokeStyle = 'rgba(27, 37, 44, 0.08)';
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
    ctx.fillStyle = 'rgba(27, 37, 44, 0.12)';
    ctx.strokeStyle = 'rgba(27, 37, 44, 0.08)';

    points.forEach(point => {
      const x = point.x + Math.sin(time / 1200 + point.phase) * 3;
      const y = point.y + Math.cos(time / 1400 + point.phase) * 3;
      const distance = Math.hypot(x - spiderX, y - spiderY);

      if (distance < 120) {
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

    ctx.shadowColor = 'rgba(20, 18, 42, 0.18)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 2;

    ctx.strokeStyle = 'rgba(25, 26, 36, 0.68)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const legs = [
      { y: -3, x1: 7, y1: -8, x2: 15, y2: -14 },
      { y: 0, x1: 9, y1: -1, x2: 18, y2: -2 },
      { y: 3, x1: 8, y1: 8, x2: 15, y2: 17 },
      { y: 5, x1: 5, y1: 13, x2: 8, y2: 26 },
    ];

    legs.forEach((leg, index) => {
      const lift = Math.sin(time / 180 + index * 1.1) * 0.9;

      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * 2.5, leg.y);
        ctx.quadraticCurveTo(
          side * leg.x1,
          leg.y1 + lift,
          side * ((leg.x1 + leg.x2) / 2),
          ((leg.y1 + leg.y2) / 2) + lift
        );
        ctx.quadraticCurveTo(
          side * leg.x2,
          leg.y2 - lift,
          side * (leg.x2 + 3),
          leg.y2 + lift
        );
        ctx.stroke();
      });
    });

    ctx.shadowBlur = 4;
    const abdomen = ctx.createRadialGradient(-1, 3, 1, 0, 3, 6);
    abdomen.addColorStop(0, 'rgba(44, 45, 128, 0.96)');
    abdomen.addColorStop(0.5, 'rgba(29, 34, 101, 0.96)');
    abdomen.addColorStop(1, 'rgba(15, 20, 42, 0.98)');

    ctx.fillStyle = abdomen;
    ctx.beginPath();
    ctx.ellipse(0, 4, 4.4, 5.8, 0, 0, Math.PI * 2);
    ctx.fill();

    const thorax = ctx.createRadialGradient(-1, -2, 1, 0, -2, 4);
    thorax.addColorStop(0, 'rgba(46, 52, 135, 0.98)');
    thorax.addColorStop(1, 'rgba(15, 20, 42, 0.98)');

    ctx.fillStyle = thorax;
    ctx.beginPath();
    ctx.ellipse(0, -2, 3.6, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(225, 230, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(-1.2, -3, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  const render = time => {
    spiderX += (targetX - spiderX) * 0.035;
    spiderY += (targetY - spiderY) * 0.035;

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
