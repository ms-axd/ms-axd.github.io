document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[data-terminal-modal]');
  const panel = modal ? modal.querySelector('.terminal-modal__panel') : null;
  const closeButton = document.querySelector('[data-terminal-close]');
  const minimizeButton = document.querySelector('[data-terminal-minimize]');
  const zoomButton = document.querySelector('[data-terminal-zoom]');
  const restoreButton = document.querySelector('[data-terminal-restore]');
  const form = document.querySelector('[data-terminal-form]');
  const input = document.querySelector('[data-terminal-input]');
  const output = document.querySelector('[data-terminal-output]');

  if (!modal || !panel || !closeButton || !minimizeButton || !zoomButton || !restoreButton || !form || !input || !output) {
    return;
  }

  const commands = {
    help: [
      'available commands:',
      '  whoami',
      '  ls',
      '  cat flag.txt',
      '  clear',
      '  exit',
    ],
    whoami: ['guest@ms_axd'],
    ls: ['about  archives  blog  categories  tags  flag.txt'],
    'cat flag.txt': ['flag{welcome_to_my_blog}'],
  };

  let hasBooted = false;

  const print = (lines, type = '') => {
    const block = document.createElement('div');
    block.className = type ? `terminal-line ${type}` : 'terminal-line';
    block.textContent = Array.isArray(lines) ? lines.join('\n') : lines;
    output.appendChild(block);
    output.scrollTop = output.scrollHeight;
  };

  const boot = () => {
    if (hasBooted) {
      return;
    }

    output.innerHTML = '';
    print('Ms_AxD mini terminal. type help.');
    hasBooted = true;
  };

  const showTerminal = () => {
    modal.hidden = false;
    restoreButton.hidden = true;
    panel.classList.remove('is-minimized');
    boot();
    requestAnimationFrame(() => input.focus());
  };

  const closeTerminal = () => {
    modal.hidden = true;
    restoreButton.hidden = false;
    panel.classList.remove('is-zoomed', 'is-minimized');
    modal.classList.remove('is-zoomed');
  };

  const minimizeTerminal = () => {
    modal.hidden = true;
    restoreButton.hidden = false;
    panel.classList.add('is-minimized');
  };

  const toggleZoom = () => {
    panel.classList.toggle('is-zoomed');
    modal.classList.toggle('is-zoomed', panel.classList.contains('is-zoomed'));
    requestAnimationFrame(() => input.focus());
  };

  restoreButton.addEventListener('click', showTerminal);
  closeButton.addEventListener('click', closeTerminal);
  minimizeButton.addEventListener('click', minimizeTerminal);
  zoomButton.addEventListener('click', toggleZoom);

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      minimizeTerminal();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const command = input.value.trim();
    input.value = '';

    if (!command) {
      return;
    }

    print(`> ${command}`, 'is-command');

    if (command === 'clear') {
      output.innerHTML = '';
      return;
    }

    if (command === 'exit') {
      closeTerminal();
      return;
    }

    print(commands[command] || `command not found: ${command}`);
  });
});
