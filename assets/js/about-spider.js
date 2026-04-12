document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('[data-spider-window]');

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const wrapper = canvas.closest('.about-spider-window');

  let width = 0;
  let height = 0;
  let targetX = 0;
  let targetY = 0;
  let bodyX = 0;
  let bodyY = 0;
  let previousX = 0;
  let previousY = 0;
  let velocityX = 0;
  let velocityY = 0;

  const legConfigs = [
    { side: -1, angle: -2.55, length: 78, phase: 0.0 },
    { side: -1, angle: -2.9, length: 92, phase: 0.8 },
    { side: -1, angle: 2.9, length: 92, phase: 1.6 },
    { side: -1, angle: 2.45, length: 78, phase: 2.4 },
    { side: 1, angle: -0.58, length: 78, phase: 1.2 },
    { side: 1, angle: -0.25, length: 92, phase: 2.0 },
    { side: 1, angle: 0.25, length: 92, phase: 2.8 },
    { side: 1, angle: 0.62, length: 78, phase: 3.6 },
  ];

  const legs = legConfigs.map(config => ({
    ...config,
    jointX: 0,
    jointY: 0,
    footX: 0,
    footY: 0,
  }));

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    targetX = width * 0.5;
    targetY = height * 0.5;
    bodyX = targetX;
    bodyY = targetY;
    previousX = bodyX;
    previousY = bodyY;

    legs.forEach(leg => {
      leg.footX = bodyX + Math.cos(leg.angle) * leg.length;
      leg.footY = bodyY + Math.sin(leg.angle) * leg.length;
      leg.jointX = bodyX + Math.cos(leg.angle) * leg.length * 0.48;
      leg.jointY = bodyY + Math.sin(leg.angle) * leg.length * 0.48;
    });
  };

  const drawLeg = (baseX, baseY, leg, time) => {
    const speed = Math.hypot(velocityX, velocityY);
    const direction = Math.atan2(velocityY, velocityX || 0.001);
    const crawl = Math.sin(time / 130 + leg.phase) * Math.min(speed * 0.8, 10);
    const spread = Math.cos(time / 180 + leg.phase) * 8;
    const stride = Math.min(speed * 3.4, 34);

    const targetFootX =
      bodyX +
      Math.cos(leg.angle) * leg.length +
      Math.cos(direction) * stride +
      Math.cos(leg.angle + Math.PI / 2) * spread;
    const targetFootY =
      bodyY +
      Math.sin(leg.angle) * leg.length +
      Math.sin(direction) * stride +
      Math.sin(leg.angle + Math.PI / 2) * spread +
      crawl;

    leg.footX += (targetFootX - leg.footX) * 0.08;
    leg.footY += (targetFootY - leg.footY) * 0.08;

    const midX = (baseX + leg.footX) * 0.5;
    const midY = (baseY + leg.footY) * 0.5;
    const bendX = Math.cos(leg.angle + leg.side * 0.72) * 26;
    const bendY = Math.sin(leg.angle + leg.side * 0.72) * 26;

    leg.jointX += (midX + bendX - leg.jointX) * 0.18;
    leg.jointY += (midY + bendY - leg.jointY) * 0.18;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.lineWidth = 1.55;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
    ctx.shadowBlur = 5;

    ctx.beginPath();
    ctx.moveTo(baseX, baseY);
    ctx.quadraticCurveTo(leg.jointX, leg.jointY, leg.footX, leg.footY);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.beginPath();
    ctx.arc(leg.footX, leg.footY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawBody = () => {
    const gradient = ctx.createRadialGradient(bodyX - 4, bodyY - 5, 2, bodyX, bodyY, 13);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.5)');

    ctx.shadowColor = 'rgba(255, 255, 255, 0.22)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY, 5.8, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const render = time => {
    previousX = bodyX;
    previousY = bodyY;
    bodyX += (targetX - bodyX) * 0.035;
    bodyY += (targetY - bodyY) * 0.035;
    velocityX = bodyX - previousX;
    velocityY = bodyY - previousY;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, width, height);

    legs.forEach(leg => {
      const baseX = bodyX + leg.side * 4;
      const baseY = bodyY + Math.sin(leg.angle) * 5;
      drawLeg(baseX, baseY, leg, time);
    });
    drawBody();

    requestAnimationFrame(render);
  };

  wrapper.addEventListener('pointermove', event => {
    const rect = canvas.getBoundingClientRect();
    targetX = event.clientX - rect.left;
    targetY = event.clientY - rect.top;
  });

  wrapper.addEventListener('pointerleave', () => {
    targetX = width * 0.5;
    targetY = height * 0.5;
  });

  window.addEventListener('resize', resize);

  resize();
  requestAnimationFrame(render);
});
