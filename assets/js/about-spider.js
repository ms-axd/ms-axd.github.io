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
    { angle: -2.72, length: 78, phase: 0.0 },
    { angle: -2.3, length: 96, phase: 0.7 },
    { angle: 2.3, length: 96, phase: 1.4 },
    { angle: 2.72, length: 78, phase: 2.1 },
    { angle: -0.42, length: 78, phase: 2.8 },
    { angle: -0.82, length: 96, phase: 3.5 },
    { angle: 0.82, length: 96, phase: 4.2 },
    { angle: 0.42, length: 78, phase: 4.9 },
  ];

  const legs = legConfigs.map(config => ({
    ...config,
    jointX: 0,
    jointY: 0,
    footX: 0,
    footY: 0,
    vx: 0,
    vy: 0,
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
      leg.vx = 0;
      leg.vy = 0;
    });
  };

  const drawLeg = (leg, time) => {
    const speed = Math.hypot(velocityX, velocityY);
    const direction = Math.atan2(velocityY, velocityX || 0.001);
    const crawl = Math.sin(time / 120 + leg.phase) * Math.min(speed * 1.4, 14);
    const spread = Math.cos(time / 190 + leg.phase) * 12;
    const stride = Math.min(speed * 5, 42);
    const normalAngle = leg.angle + Math.PI / 2;

    const targetFootX =
      bodyX +
      Math.cos(leg.angle) * leg.length +
      Math.cos(direction) * stride +
      Math.cos(normalAngle) * spread;
    const targetFootY =
      bodyY +
      Math.sin(leg.angle) * leg.length +
      Math.sin(direction) * stride +
      Math.sin(normalAngle) * spread +
      crawl;

    leg.vx += (targetFootX - leg.footX) * 0.018;
    leg.vy += (targetFootY - leg.footY) * 0.018;
    leg.vx *= 0.78;
    leg.vy *= 0.78;
    leg.footX += leg.vx;
    leg.footY += leg.vy;

    const midX = (bodyX + leg.footX) * 0.5;
    const midY = (bodyY + leg.footY) * 0.5;
    const bend = Math.sin(time / 210 + leg.phase) * 18 + 24;
    const bendX = Math.cos(normalAngle) * bend;
    const bendY = Math.sin(normalAngle) * bend;

    leg.jointX += (midX + bendX - leg.jointX) * 0.16;
    leg.jointY += (midY + bendY - leg.jointY) * 0.16;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.86)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.18)';
    ctx.shadowBlur = 4;

    ctx.beginPath();
    ctx.moveTo(bodyX, bodyY);
    ctx.lineTo(leg.jointX, leg.jointY);
    ctx.lineTo(leg.footX, leg.footY);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.58)';
    ctx.beginPath();
    ctx.arc(leg.jointX, leg.jointY, 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.beginPath();
    ctx.arc(leg.footX, leg.footY, 2.2, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawCenter = () => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.26)';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(bodyX, bodyY, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  const render = time => {
    previousX = bodyX;
    previousY = bodyY;
    bodyX += (targetX - bodyX) * 0.075;
    bodyY += (targetY - bodyY) * 0.075;
    velocityX = bodyX - previousX;
    velocityY = bodyY - previousY;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#030405';
    ctx.fillRect(0, 0, width, height);

    legs.forEach(leg => drawLeg(leg, time));
    drawCenter();

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
