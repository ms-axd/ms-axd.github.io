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
    targetY = height * 0.56;
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

    ctx.shadowColor = 'rgba(3, 20, 10, 0.22)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    ctx.strokeStyle = 'rgba(20, 34, 24, 0.82)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const legs = [
      { y: -7, a: -16, b: -23, c: -31 },
      { y: -3, a: -20, b: -31, c: -38 },
      { y: 2, a: -19, b: -30, c: -36 },
      { y: 7, a: -14, b: -22, c: -28 },
    ];

    legs.forEach((leg, index) => {
      const lift = Math.sin(time / 170 + index * 1.3) * 1.8;

      [-1, 1].forEach(side => {
        ctx.beginPath();
        ctx.moveTo(side * 4, leg.y);
        ctx.quadraticCurveTo(
          side * 13,
          leg.y + lift,
          side * 18,
          leg.a + lift
        );
        ctx.quadraticCurveTo(
          side * 26,
          leg.b - lift,
          side * 36,
          leg.c + lift
        );
        ctx.stroke();

        ctx.fillStyle = 'rgba(20, 34, 24, 0.72)';
        ctx.beginPath();
        ctx.arc(side * 18, leg.a + lift, 1.9, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    ctx.shadowBlur = 8;
    const abdomen = ctx.createRadialGradient(-2, 4, 2, 0, 4, 13);
    abdomen.addColorStop(0, 'rgba(112, 138, 65, 0.96)');
    abdomen.addColorStop(0.45, 'rgba(64, 91, 46, 0.96)');
    abdomen.addColorStop(1, 'rgba(24, 38, 27, 0.98)');

    ctx.fillStyle = abdomen;
    ctx.beginPath();
    ctx.ellipse(0, 4, 9, 12, 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(238, 248, 240, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(-1, 4, 5, 9, 0.08, 0, Math.PI * 2);
    ctx.stroke();

    const thorax = ctx.createRadialGradient(-2, -8, 1, 0, -7, 8);
    thorax.addColorStop(0, 'rgba(72, 101, 49, 0.98)');
    thorax.addColorStop(1, 'rgba(20, 34, 24, 0.98)');

    ctx.fillStyle = thorax;
    ctx.beginPath();
    ctx.ellipse(0, -8, 7, 6, -0.04, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(222, 246, 224, 0.72)';
    ctx.beginPath();
    ctx.ellipse(-3, -10, 1.4, 1.1, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(10, 16, 12, 0.9)';
    [-3, 3].forEach(x => {
      ctx.beginPath();
      ctx.arc(x, -12, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(20, 34, 24, 0.72)';
    ctx.lineWidth = 1.2;
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.moveTo(side * 2.2, -12);
      ctx.quadraticCurveTo(side * 6, -17, side * 9, -19);
      ctx.stroke();
    });

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
    targetX = width * 0.62;
    targetY = height * 0.56;
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(render);
});
