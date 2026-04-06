document.addEventListener('DOMContentLoaded', () => {
  const highlight = document.querySelector('.cursor-highlight');
  const root = document.body || document.documentElement;

  if (!highlight || !root) {
    return;
  }

  const allowedModes = new Set(['auto', 'force', 'off']);
  const modeAttr = (root.dataset.motionEffects || 'auto').toLowerCase();
  const motionMode = allowedModes.has(modeAttr) ? modeAttr : 'auto';

  if (motionMode === 'off') {
    highlight.remove();
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
    currentX: window.innerWidth / 2,
    currentY: window.innerHeight / 2,
    targetX: window.innerWidth / 2,
    targetY: window.innerHeight / 2,
    rafId: null
  };

  const translate = (x, y) => {
    highlight.style.transform = `translate3d(${x - 55}px, ${y - 55}px, 0)`;
  };

  const handleMouseMove = event => {
    document.body.classList.add('cursor-active');

    if (isLowMotionMode) {
      translate(event.clientX, event.clientY);
      return;
    }

    state.targetX = event.clientX;
    state.targetY = event.clientY;
  };

  const handleMouseLeave = () => {
    document.body.classList.remove('cursor-active');
  };

  const attachPressHandlers = () => {
    document.addEventListener('mousedown', () => {
      highlight.style.width = '92px';
      highlight.style.height = '92px';
    });

    document.addEventListener('mouseup', () => {
      highlight.style.width = '110px';
      highlight.style.height = '110px';
    });
  };

  const startAnimationLoop = () => {
    const render = () => {
      state.currentX += (state.targetX - state.currentX) * 0.18;
      state.currentY += (state.targetY - state.currentY) * 0.18;
      translate(state.currentX, state.currentY);
      state.rafId = window.requestAnimationFrame(render);
    };

    render();
  };

  const cancelAnimationLoop = () => {
    if (state.rafId !== null) {
      window.cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  };

  const startEffect = () => {
    if (effectStarted) {
      return;
    }

    effectStarted = true;
    root.classList.toggle('cursor-low-motion', isLowMotionMode);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    attachPressHandlers();

    if (!isLowMotionMode) {
      startAnimationLoop();
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
    root.classList.toggle('cursor-low-motion', isLowMotionMode);

    if (!effectStarted) {
      return;
    }

    if (isLowMotionMode) {
      cancelAnimationLoop();
    } else if (state.rafId === null) {
      state.currentX = state.targetX;
      state.currentY = state.targetY;
      startAnimationLoop();
    }
  };

  if (typeof reducedMotionQuery.addEventListener === 'function') {
    reducedMotionQuery.addEventListener('change', onMotionPreferenceChange);
  } else if (typeof reducedMotionQuery.addListener === 'function') {
    reducedMotionQuery.addListener(onMotionPreferenceChange);
  }

  waitForFinePointer();
});
