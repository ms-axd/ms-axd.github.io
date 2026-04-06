document.addEventListener('DOMContentLoaded', () => {
  const highlight = document.querySelector('.cursor-highlight');

  if (!highlight) {
    return;
  }

  const isFinePointer = window.matchMedia('(any-pointer: fine)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!isFinePointer || prefersReducedMotion) {
    highlight.remove();
    return;
  }

  const state = {
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    rafId: null
  };

  const render = () => {
    state.currentX += (state.targetX - state.currentX) * 0.18;
    state.currentY += (state.targetY - state.currentY) * 0.18;

    highlight.style.transform = `translate3d(${state.currentX - 55}px, ${state.currentY - 55}px, 0)`;
    state.rafId = window.requestAnimationFrame(render);
  };

  document.addEventListener('mousemove', event => {
    state.targetX = event.clientX;
    state.targetY = event.clientY;
    document.body.classList.add('cursor-active');
  });

  document.addEventListener('mouseleave', () => {
    document.body.classList.remove('cursor-active');
  });

  document.addEventListener('mousedown', () => {
    highlight.style.width = '92px';
    highlight.style.height = '92px';
  });

  document.addEventListener('mouseup', () => {
    highlight.style.width = '110px';
    highlight.style.height = '110px';
  });

  render();
});
