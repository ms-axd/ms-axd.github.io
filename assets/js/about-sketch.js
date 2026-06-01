(function () {
  const canvas = Array.from(document.querySelectorAll('[data-sketch-canvas]'))
    .find((item) => item.offsetParent !== null);

  if (!canvas) {
    return;
  }

  const context = canvas.getContext('2d');
  const colorButtons = Array.from(document.querySelectorAll('[data-sketch-color]'));
  const clearButton = document.querySelector('[data-sketch-clear]');
  let isDrawing = false;
  let strokeColor = '#245b37';

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
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const draw = (event) => {
    if (!isDrawing) {
      return;
    }

    const point = getPoint(event);

    context.strokeStyle = strokeColor;
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const stopDrawing = () => {
    isDrawing = false;
    context.closePath();
  };

  colorButtons.forEach((button) => {
    button.addEventListener('click', () => {
      strokeColor = button.dataset.sketchColor;
      colorButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    });
  });

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
