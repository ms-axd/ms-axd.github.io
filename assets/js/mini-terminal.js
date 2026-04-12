document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('[data-terminal-modal]');
  const openButton = document.querySelector('[data-terminal-open]');
  const closeButton = document.querySelector('[data-terminal-close]');
  const form = document.querySelector('[data-terminal-form]');
  const input = document.querySelector('[data-terminal-input]');
  const output = document.querySelector('[data-terminal-output]');

  if (!modal || !openButton || !closeButton || !form || !input || !output) {
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
    'cat flag.txt': ['flag{keep_learning_keep_hacking}'],
  };

  const print = (lines, type = '') => {
    const block = document.createElement('div');
    block.className = type ? `terminal-line ${type}` : 'terminal-line';
    block.textContent = Array.isArray(lines) ? lines.join('\n') : lines;
    output.appendChild(block);
    output.scrollTop = output.scrollHeight;
  };

  const reset = () => {
    output.innerHTML = '';
    print('Ms_AxD mini terminal. type help.');
  };

  const openTerminal = () => {
    modal.hidden = false;
    document.body.classList.add('terminal-is-open');
    reset();
    requestAnimationFrame(() => input.focus());
  };

  const closeTerminal = () => {
    modal.hidden = true;
    document.body.classList.remove('terminal-is-open');
  };

  openButton.addEventListener('click', openTerminal);
  closeButton.addEventListener('click', closeTerminal);

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeTerminal();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeTerminal();
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
      reset();
      return;
    }

    if (command === 'exit') {
      closeTerminal();
      return;
    }

    print(commands[command] || `command not found: ${command}`);
  });
});
