(function () {
  const canvas = Array.from(document.querySelectorAll('[data-sketch-canvas]'))
    .find((item) => item.offsetParent !== null);

  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const colorButtons = Array.from(document.querySelectorAll('[data-sketch-color]'));
  const customColorInput = document.querySelector('[data-sketch-custom-color]');
  const clearButton = document.querySelector('[data-sketch-clear]');
  let isDrawing = false;
  let strokeColor = '#245b37';
  let lastPoint = null;

  const hexToRgba = (hex, alpha) => {
    const color = hex.replace('#', '');
    const red = parseInt(color.slice(0, 2), 16);
    const green = parseInt(color.slice(2, 4), 16);
    const blue = parseInt(color.slice(4, 6), 16);

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.lineWidth = 4;
    context.lineCap = 'round';
    context.lineJoin = 'round';
  };

  const getPoint = (event) => {
    const rect = canvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  };

  const startDrawing = (event) => {
    const point = getPoint(event);

    isDrawing = true;
    canvas.setPointerCapture(event.pointerId);
    lastPoint = point;
  };

  const drawWatercolorLine = (from, to) => {
    const control = {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2
    };

    context.save();
    context.globalCompositeOperation = 'multiply';

    for (let index = 0; index < 5; index += 1) {
      const spread = index * 0.45;
      const offsetX = (Math.random() - 0.5) * spread;
      const offsetY = (Math.random() - 0.5) * spread;

      context.beginPath();
      context.strokeStyle = hexToRgba(strokeColor, index === 0 ? 0.34 : 0.055);
      context.lineWidth = index === 0 ? 1.7 : 2.4 + index * 0.35;
      context.moveTo(from.x + offsetX, from.y + offsetY);
      context.quadraticCurveTo(
        control.x + offsetX,
        control.y + offsetY,
        to.x + offsetX,
        to.y + offsetY
      );
      context.stroke();
    }

    context.restore();
  };

  const drawPoint = (point) => {
    if (!lastPoint) {
      lastPoint = point;
      return;
    }

    drawWatercolorLine(lastPoint, point);
    lastPoint = point;
  };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }

    const events = typeof event.getCoalescedEvents === 'function'
      ? event.getCoalescedEvents()
      : [event];

    events.forEach((pointerEvent) => drawPoint(getPoint(pointerEvent)));
  };

  const stopDrawing = () => {
    isDrawing = false;
    lastPoint = null;
  };

  colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      strokeColor = button.dataset.sketchColor;
      if (customColorInput) {
        customColorInput.value = strokeColor;
      }
      colorButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    });
  });

  if (customColorInput) {
    customColorInput.addEventListener('input', () => {
      strokeColor = customColorInput.value;
      colorButtons.forEach((button) => button.classList.remove('is-active'));
    });
  }

  if (clearButton) {
    clearButton.addEventListener('click', () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
    });
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  canvas.addEventListener('pointerdown', startDrawing);
  canvas.addEventListener('pointermove', draw);
  canvas.addEventListener('pointerup', stopDrawing);
  canvas.addEventListener('pointercancel', stopDrawing);
  canvas.addEventListener('pointerleave', stopDrawing);
}());
