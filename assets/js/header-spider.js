document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const canvas = document.querySelector('.header-spider-layer');

  if (!header || !canvas) {
    return;
  }

  const isFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isFinePointer || prefersReducedMotion) {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');
  const state = {
    currentX: 140,
    currentY: 52,
    targetX: 140,
    targetY: 52,
    anchorX: 140,
    visible: false
  };

  const legs = [
    [-11, -2, -17, 4, -20, 11],
    [-10, 2, -15, 9, -18, 17],
    [-8, 5, -11, 12, -12, 20],
    [-5, 7, -6, 14, -5, 22],
    [11, -2, 17, 4, 20, 11],
    [10, 2, 15, 9, 18, 17],
    [8, 5, 11, 12, 12, 20],
    [5, 7, 6, 14, 5, 22]
  ];

  const resize = () => {
    const rect = header.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    state.anchorY = 0;
  };

  const clampTarget = (clientX, clientY) => {
    const rect = header.getBoundingClientRect();
    const x = Math.max(28, Math.min(rect.width - 28, clientX - rect.left));
    const y = Math.max(32, Math.min(rect.height - 22, clientY - rect.top));
    state.targetX = x;
    state.targetY = y;
    state.anchorX = x;
  };

  const drawLeg = (x, y, leg) => {
    ctx.beginPath();
    ctx.moveTo(x + leg[0], y + leg[1]);
    ctx.quadraticCurveTo(x + leg[2], y + leg[3], x + leg[4], y + leg[5]);
    ctx.stroke();
  };

  const render = () => {
    const rect = header.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    state.currentX += (state.targetX - state.currentX) * 0.09;
    state.currentY += (state.targetY - state.currentY) * 0.11;

    if (state.visible) {
      ctx.strokeStyle = 'rgba(210, 255, 228, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(state.anchorX, state.anchorY);
      ctx.lineTo(state.currentX, state.currentY - 8);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(8, 15, 23, 0.86)';
      ctx.lineWidth = 1.2;
      legs.forEach(leg => drawLeg(state.currentX, state.currentY, leg));

      ctx.fillStyle = 'rgba(5, 10, 14, 0.95)';
      ctx.beginPath();
      ctx.ellipse(state.currentX, state.currentY, 8, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(110, 231, 183, 0.7)';
      ctx.beginPath();
      ctx.arc(state.currentX + 2, state.currentY - 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    window.requestAnimationFrame(render);
  };

  header.addEventListener('mousemove', event => {
    state.visible = true;
    clampTarget(event.clientX, event.clientY);
  });

  header.addEventListener('mouseenter', event => {
    state.visible = true;
    clampTarget(event.clientX, event.clientY);
    state.currentX = state.targetX;
    state.currentY = state.targetY;
  });

  header.addEventListener('mouseleave', () => {
    state.visible = false;
  });

  window.addEventListener('resize', resize);

  resize();
  render();
});
