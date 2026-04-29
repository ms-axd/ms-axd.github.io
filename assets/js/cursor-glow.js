document.addEventListener('DOMContentLoaded', () => {
  const glow = document.querySelector('.cursor-glow');

  if (!glow || window.matchMedia('(pointer: coarse)').matches) {
    return;
  }

  let targetX = -200;
  let targetY = -200;
  let currentX = targetX;
  let currentY = targetY;
  let isVisible = false;

  const render = () => {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    glow.style.opacity = isVisible ? '1' : '0';
    requestAnimationFrame(render);
  };

  document.addEventListener('pointermove', event => {
    targetX = event.clientX - 110;
    targetY = event.clientY - 110;
    isVisible = true;
  });

  document.addEventListener('pointerleave', () => {
    isVisible = false;
  });

  render();
});
