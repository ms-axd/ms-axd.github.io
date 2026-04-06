document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header');
  const canvas = document.querySelector('.header-spider-layer');
  const root = document.body || document.documentElement;

  if (!header || !canvas || !root) {
    return;
  }

  const allowedModes = new Set(['auto', 'force', 'off']);
  const modeAttr = (root.dataset.motionEffects || 'auto').toLowerCase();
  const motionMode = allowedModes.has(modeAttr) ? modeAttr : 'auto';

  if (motionMode === 'off') {
    canvas.remove();
    return;
  }

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    canvas.remove();
    return;
  }

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointerQuery = window.matchMedia('(pointer: fine)');
  const anyPointerQuery = window.matchMedia('(any-pointer: fine)');

  const hasFinePointer = () => pointerQuery.matches || anyPointerQuery.matches;
  const shouldUseLowMotion = () => reducedMotionQuery.matches && motionMode !== 'force';

  let isLowMotionMode = shouldUseLowMotion();
  let effectStarted = false;

  const attachMediaQueryListener = (query, callback) => {
    if (!query || typeof query.addEventListener !== 'function') {
      if (query && typeof query.addListener === 'function') {
        const handler = event => {
          if (event.matches) {
            callback();
          }
        };
        query.addListener(handler);
        return () => query.removeListener(handler);
      }
      return null;
    }

    const handler = event => {
      if (event.matches) {
        callback();
      }
    };

    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  };

  const state = {
    currentX: 140,
    currentY: 52,
    targetX: 140,
    targetY: 52,
    anchorX: 140,
    anchorY: 0,
    visible: false,
    rafId: null
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
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
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

  const drawSpider = (x, y) => {
    ctx.strokeStyle = 'rgba(210, 255, 228, 0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(state.anchorX, state.anchorY);
    ctx.lineTo(x, y - 8);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(8, 15, 23, 0.86)';
    ctx.lineWidth = 1.2;
    legs.forEach(leg => drawLeg(x, y, leg));

    ctx.fillStyle = 'rgba(5, 10, 14, 0.95)';
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(110, 231, 183, 0.7)';
    ctx.beginPath();
    ctx.arc(x + 2, y - 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  };

  const clearCanvas = () => {
    const rect = header.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
  };

  const drawInstantFrame = () => {
    clearCanvas();

    if (!state.visible) {
      return;
    }

    state.currentX = state.targetX;
    state.currentY = state.targetY;
    drawSpider(state.currentX, state.currentY);
  };

  const render = () => {
    clearCanvas();

    // Smaller easing factor so the spider/web trails behind slower for a floaty feel
    state.currentX += (state.targetX - state.currentX) * 0.03;
    state.currentY += (state.targetY - state.currentY) * 0.035;

    if (state.visible) {
      drawSpider(state.currentX, state.currentY);
    }

    state.rafId = window.requestAnimationFrame(render);
  };

  const cancelAnimationLoop = () => {
    if (state.rafId !== null) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  };

  const handleMouseMove = event => {
    state.visible = true;
    clampTarget(event.clientX, event.clientY);

    if (isLowMotionMode) {
      drawInstantFrame();
    }
  };

  const handleMouseEnter = event => {
    state.visible = true;
    clampTarget(event.clientX, event.clientY);
    state.currentX = state.targetX;
    state.currentY = state.targetY;

    if (isLowMotionMode) {
      drawInstantFrame();
    }
  };

  const handleMouseLeave = () => {
    state.visible = false;

    if (isLowMotionMode) {
      clearCanvas();
    }
  };

  const startEffect = () => {
    if (effectStarted) {
      return;
    }

    effectStarted = true;
    resize();
    drawInstantFrame();

    header.addEventListener('mousemove', handleMouseMove, { passive: true });
    header.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    header.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', resize);

    if (!isLowMotionMode) {
      render();
    }
  };

  const waitForFinePointer = () => {
    if (hasFinePointer()) {
      startEffect();
      return;
    }

    let resolved = false;
    const cleanups = [];

    const resolve = () => {
      if (resolved) {
        return;
      }

      resolved = true;
      cleanups.forEach(fn => fn && fn());
      startEffect();
    };

    const fallbackHandler = event => {
      const pointerType = event.pointerType || (event instanceof MouseEvent ? 'mouse' : undefined);

      if (pointerType === 'mouse' || pointerType === 'pen') {
        resolve();
      }
    };

    if (window.PointerEvent) {
      window.addEventListener('pointermove', fallbackHandler, { passive: true });
    }

    window.addEventListener('mousemove', fallbackHandler, { passive: true });

    cleanups.push(() => {
      if (window.PointerEvent) {
        window.removeEventListener('pointermove', fallbackHandler);
      }

      window.removeEventListener('mousemove', fallbackHandler);
    });

    [pointerQuery, anyPointerQuery].forEach(query => {
      const removeListener = attachMediaQueryListener(query, resolve);
      if (removeListener) {
        cleanups.push(removeListener);
      }
    });
  };

  const onMotionPreferenceChange = event => {
    const shouldReduce = event.matches && motionMode !== 'force';

    if (shouldReduce === isLowMotionMode) {
      return;
    }

    isLowMotionMode = shouldReduce;

    if (!effectStarted) {
      return;
    }

    if (isLowMotionMode) {
      cancelAnimationLoop();
      drawInstantFrame();
    } else {
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      render();
    }
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(onMotionPreferenceChange);
  }

  waitForFinePointer();
});
