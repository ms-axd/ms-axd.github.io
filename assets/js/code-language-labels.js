(function () {
  const languageNames = {
    bash: "Bash",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    css: "CSS",
    go: "Go",
    html: "HTML",
    java: "Java",
    javascript: "JavaScript",
    js: "JavaScript",
    json: "JSON",
    markdown: "Markdown",
    md: "Markdown",
    plaintext: "Text",
    powershell: "PowerShell",
    ps1: "PowerShell",
    py: "Python",
    python: "Python",
    ruby: "Ruby",
    rust: "Rust",
    rs: "Rust",
    shell: "Shell",
    sh: "Shell",
    solidity: "Solidity",
    sol: "Solidity",
    sql: "SQL",
    text: "Text",
    ts: "TypeScript",
    typescript: "TypeScript",
    xml: "XML",
    yaml: "YAML",
    yml: "YAML",
  };

  function findLanguage(element) {
    const candidates = [
      element,
      element.querySelector("code"),
      element.closest(".highlight"),
      element.closest("[class*='language-']"),
      element.closest("[class*='highlight-']"),
    ].filter(Boolean);

    for (const candidate of candidates) {
      for (const className of candidate.classList) {
        if (className.startsWith("language-")) {
          return className.replace("language-", "");
        }

        if (className.startsWith("highlight-")) {
          return className.replace("highlight-", "");
        }
      }
    }

    return "";
  }

  function formatLanguage(language) {
    const normalized = language.toLowerCase();

    if (languageNames[normalized]) {
      return languageNames[normalized];
    }

    return normalized
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function updateBarWidth(pre) {
    const bar = pre.querySelector(".code-window-bar");
    const code = pre.querySelector("code");

    if (!bar) {
      return;
    }

    const paddingLeft = parseFloat(getComputedStyle(pre).paddingLeft) || 0;
    const paddingRight = parseFloat(getComputedStyle(pre).paddingRight) || 0;
    const codeWidth = code ? code.scrollWidth + paddingLeft + paddingRight : 0;
    const width = Math.max(pre.clientWidth, codeWidth);

    bar.style.width = `${width}px`;
  }

  const codeBlocks = [];

  document.querySelectorAll("article .post-content pre").forEach((pre) => {
    const language = findLanguage(pre);
    const code = pre.querySelector("code");

    if (!pre.querySelector(".code-window-bar")) {
      const bar = document.createElement("span");
      bar.className = "code-window-bar";
      bar.setAttribute("aria-hidden", "true");
      bar.textContent = "Ms_AxD";
      pre.insertBefore(bar, pre.firstChild);
    }

    codeBlocks.push(pre);
    updateBarWidth(pre);

    if (!language || pre.querySelector(".code-language-label")) {
      return;
    }

    const label = document.createElement("span");
    label.className = "code-language-label";
    label.textContent = formatLanguage(language);
    pre.insertBefore(label, code || null);
  });

  window.addEventListener("load", () => {
    codeBlocks.forEach(updateBarWidth);
  });

  window.addEventListener("resize", () => {
    codeBlocks.forEach(updateBarWidth);
  });
})();
