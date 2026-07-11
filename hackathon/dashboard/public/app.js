/* ═══════════════════════════════════════════════
   Escape Dashboard — Client Logic
   ═══════════════════════════════════════════════ */

// ── State ────────────────────────────────────────
let authHeader = '';

if (!document.getElementById('chat-custom-styles')) {
  const style = document.createElement('style');
  style.id = 'chat-custom-styles';
  style.textContent = `
    .chat-interactable {
      transition: all 0.2s;
    }
    .chat-interactable:hover {
      filter: brightness(1.2);
      transform: translateY(-1px);
    }
    .chat-interactable:active {
      transform: translateY(0);
    }
    .poll-opt-hover:hover {
      background: var(--bg-3) !important;
      border-color: var(--border-light) !important;
    }
    .todo-hover:hover {
      background: var(--bg-2) !important;
      transform: translateX(2px);
    }
  `;
  document.head.appendChild(style);
}
let config = null;
let chatHistory = [];
let allChats = [];
let currentChatId = null;
let usageInterval = null;
let isStreaming = false;
const MAX_REFERENCE_IMAGES = 3;
let referenceImages = [];

// ── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initLogin();
  initSidebar();
  initFileUpload();
  initImageReference();

  // Try restoring session
  const saved = localStorage.getItem('auth');
  if (saved) {
    authHeader = saved;
    document.getElementById('login-overlay').classList.add('hidden');
    tryAuth();
  }
});

// ══════════════════════════════════════════════════
// Auth
// ══════════════════════════════════════════════════

function initLogin() {
  const form = document.getElementById('login-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    authHeader = 'Basic ' + btoa(user + ':' + pass);
    await tryAuth();
  });

  document.getElementById('logout-btn').addEventListener('click', logout);
}

async function tryAuth() {
  const errEl = document.getElementById('login-error');
  errEl.classList.add('hidden');

  try {
    const res = await apiFetch('/api/config');
    config = res;
    setupModels(config.llms);
    localStorage.setItem('auth', authHeader);
    document.cookie = `auth=${authHeader}; path=/; max-age=86400; SameSite=None; Secure; Partitioned; domain=${window.location.hostname}`;
    showDashboard();
  } catch (err) {
    console.error("tryAuth failed:", err);
    errEl.textContent = err.message || 'Falsche Anmeldedaten';
    errEl.classList.remove('hidden');
    localStorage.removeItem('auth');
    document.cookie = `auth=; path=/; max-age=0; SameSite=None; Secure; Partitioned; domain=${window.location.hostname}`;
    document.getElementById('login-overlay').classList.remove('hidden');
  }
}

function logout() {
  localStorage.removeItem('auth');
  document.cookie = `auth=; path=/; max-age=0; SameSite=None; Secure; Partitioned; domain=${window.location.hostname}`;
  authHeader = '';
  config = null;
  chatHistory = [];
  if (usageInterval) clearInterval(usageInterval);
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('login-overlay').classList.remove('hidden');
  document.getElementById('login-user').value = '';
  document.getElementById('login-pass').value = '';
}

// ══════════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════════

function setupModels(llms) {
  if (!llms) return;

  const chatSelect = document.getElementById('chat-model-select');
  const chatContainer = document.getElementById('chat-model-container');
  if (llms.chat && llms.chat.length > 0) {
    chatSelect.innerHTML = llms.chat.map(m => `<option value="${m}">${m}</option>`).join('');
    if (llms.chat.length > 1) chatContainer.style.display = 'block';
    else chatContainer.style.display = 'none';
  }

  const imageSelect = document.getElementById('image-model-select');
  const imageContainer = document.getElementById('image-model-container');
  if (llms.image && llms.image.length > 0) {
    imageSelect.innerHTML = llms.image.map(m => `<option value="${m}">${m}</option>`).join('');
    if (llms.image.length > 1) imageContainer.style.display = 'flex';
    else imageContainer.style.display = 'none';
  }

  const audioSelect = document.getElementById('audio-model-select');
  const audioContainer = document.getElementById('audio-model-container');
  if (llms.audio && llms.audio.length > 0) {
    audioSelect.innerHTML = llms.audio.map(m => `<option value="${m}">${m}</option>`).join('');
    if (llms.audio.length > 1) audioContainer.style.display = 'flex';
    else audioContainer.style.display = 'none';
  }
}

function showDashboard() {
  document.getElementById('login-overlay').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');

  // Set team info
  document.getElementById('team-name').textContent = config.name;
  document.title = `${config.name} — Escape Dashboard`;

  // Set iframes
  let openCodeUrl = config.opencode_url;
  if (openCodeUrl) {
    openCodeUrl = openCodeUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
  }

  document.getElementById('opencode-iframe').src = openCodeUrl;
  document.getElementById('opencode-link').href = openCodeUrl;

  let vscodeUrl = config.vscode_url;
  if (vscodeUrl) {
    vscodeUrl = vscodeUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
  }
  const vscodeLink = document.getElementById('vscode-link');
  if (vscodeLink) {
    vscodeLink.href = vscodeUrl;
  }

  let devUrl = config.devserver_url;
  if (devUrl) {
    devUrl = devUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
  }
  document.getElementById('devserver-iframe').src = devUrl;
  document.getElementById('devserver-link').href = devUrl;

  // Init QR Code
  const qrImg = document.getElementById('devserver-qr-img');
  if (qrImg) qrImg.src = `/api/qr?url=${encodeURIComponent(devUrl)}`;

  const qrBtn = document.getElementById('devserver-qr-btn');
  const qrDropdown = document.getElementById('devserver-qr-dropdown');
  if (qrBtn && qrDropdown) {
    qrBtn.onclick = (e) => {
      e.stopPropagation();
      qrDropdown.classList.toggle('show');
    };
    document.addEventListener('click', (e) => {
      if (!qrDropdown.contains(e.target) && e.target !== qrBtn) {
        qrDropdown.classList.remove('show');
      }
    });
  }

  // Initialize console listener
  initConsoleListener();

  // Load data
  loadFiles();
  loadUsage();
  loadHistory();
  initGlobalChat();
  if (usageInterval) clearInterval(usageInterval);
  usageInterval = setInterval(loadUsage, 30000);

  const usageRefreshBtn = document.getElementById('usage-refresh-btn');
  if (usageRefreshBtn) usageRefreshBtn.addEventListener('click', loadUsage);

  // Address bar & Reload logic
  const reloadBtn = document.getElementById('devserver-reload-btn');
  const pathInput = document.getElementById('devserver-path-input');
  const devIframe = document.getElementById('devserver-iframe');
  
  if (reloadBtn) {
    reloadBtn.onclick = () => {
      // Send a reload message to the React app to let it reload itself.
      // This bypasses any CORS issues or browser URL cache quirks.
      devIframe.contentWindow.postMessage({ type: 'ESCAPE_RELOAD' }, '*');
      
      // As a fallback for when the app is completely crashed and can't receive messages,
      // we also forcefully reset the src after a short delay to the target URL.
      setTimeout(() => {
        let currentPath = pathInput.value || '';
        if (!currentPath.startsWith('/')) currentPath = '/' + currentPath;
        const targetUrl = new URL(currentPath, devUrl).href;
        
        // Only set src if the iframe hasn't already begun reloading.
        // We can't perfectly check this cross-origin, but setting it again is mostly harmless.
        if (devIframe.src !== targetUrl) {
          devIframe.src = targetUrl;
        } else {
          // If it is the exact same, just forcefully re-assign it to trigger a load
          devIframe.src = devIframe.src;
        }
      }, 300);
    };
  }
  
  if (pathInput) {
    pathInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        let newPath = pathInput.value;
        if (!newPath.startsWith('/')) newPath = '/' + newPath;
        devIframe.contentWindow.postMessage({ type: 'ESCAPE_NAVIGATE', path: newPath }, '*');
      }
    });
  }

  lucide.createIcons();
}

// ══════════════════════════════════════════════════
// Usage
// ══════════════════════════════════════════════════

async function loadUsage() {
  const container = document.getElementById('mini-usage-container');

  try {
    const data = await apiFetch('/api/usage');
    const info = data.info || data;
    const spend = info.spend ?? 0;
    const maxBudget = info.max_budget ?? null;

    if (maxBudget !== null) {
      const remaining = maxBudget - spend;
      const pct = maxBudget > 0 ? Math.min((spend / maxBudget) * 100, 100) : 0;
      const barColor = pct > 90 ? 'var(--danger)' : pct > 70 ? 'var(--warning)' : 'var(--success)';

      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;background:var(--bg-2);padding:6px 16px;border-radius:24px;border:1px solid var(--border);">
          <div style="display:flex;flex-direction:column;align-items:flex-end;">
            <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;letter-spacing:0.5px;">Guthaben</div>
            <div style="font-size:13px;font-family:var(--mono);font-weight:600;">$${remaining.toFixed(2)} / $${maxBudget.toFixed(2)}</div>
          </div>
          <div style="width:60px;height:6px;background:var(--bg-0);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${100 - pct}%;background:${barColor};"></div>
          </div>
        </div>`;
    } else {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;background:var(--bg-2);padding:6px 16px;border-radius:24px;border:1px solid var(--border);">
          <div style="font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;">Ausgaben</div>
          <div style="font-size:13px;font-family:var(--mono);font-weight:600;">$${spend.toFixed(2)}</div>
        </div>`;
    }

  } catch (err) {
    container.innerHTML = `
      <div style="color:var(--danger);font-size:12px;display:flex;align-items:center;gap:6px;background:var(--danger-bg);padding:6px 12px;border-radius:24px;">
        <i data-lucide="alert-triangle" style="width:14px;height:14px;"></i>
        <span>API Fehler</span>
      </div>`;
    lucide.createIcons();
  }
}

// ══════════════════════════════════════════════════
// Files
// ══════════════════════════════════════════════════

function initFileUpload() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');

  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });
}

async function handleFiles(fileList) {
  const files = Array.from(fileList);
  if (!files.length) return;

  const progressEl = document.getElementById('upload-progress');
  const fillEl = document.getElementById('progress-fill');
  const statusEl = document.getElementById('upload-status');

  progressEl.classList.remove('hidden');
  let done = 0;

  for (const file of files) {
    statusEl.textContent = `${file.name} wird hochgeladen… (${done + 1}/${files.length})`;
    fillEl.style.width = `${(done / files.length) * 100}%`;

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: authHeader },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        toast(`Fehler: ${err.error}`, 'error');
      }

      done++;
      fillEl.style.width = `${(done / files.length) * 100}%`;
    } catch (err) {
      toast(`Upload fehlgeschlagen: ${file.name}`, 'error');
      done++;
    }
  }

  statusEl.textContent = `${done} Datei(en) hochgeladen`;
  setTimeout(() => progressEl.classList.add('hidden'), 2000);
  loadFiles();
}

async function loadFiles() {
  const container = document.getElementById('file-list');

  try {
    const files = await apiFetch('/api/files');

    if (!files.length) {
      container.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:13px">Noch keine Dateien hochgeladen</div>';
      return;
    }

    container.innerHTML = files.map(f => {
      let thumbHtml;
      if (f.type === 'image') {
        thumbHtml = `<div class="file-thumb"><img src="${f.url}" alt="" loading="lazy"></div>`;
      } else if (f.type === 'video') {
        thumbHtml = `<div class="file-thumb"><i data-lucide="film"></i></div>`;
      } else if (f.type === 'audio') {
        thumbHtml = `<div class="file-thumb"><i data-lucide="music"></i></div>`;
      } else {
        thumbHtml = `<div class="file-thumb"><i data-lucide="file"></i></div>`;
      }

      return `
        <div class="file-item">
          ${thumbHtml}
          <div class="file-info">
            <div class="file-name" title="${f.filename}">${f.filename}</div>
            <div class="file-meta">${formatBytes(f.size)} · ${formatDate(f.created)}</div>
          </div>
          <div class="file-actions">
            <button class="btn-ghost btn-sm" onclick="copyFileUrl('${f.url}')" title="URL kopieren"><i data-lucide="link"></i></button>
            <button class="btn-ghost btn-sm" onclick="deleteFile('${f.filename}')" title="Löschen"><i data-lucide="trash-2"></i></button>
          </div>
        </div>`;
    }).join('');

    lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="usage-error"><span>${err.message}</span></div>`;
  }
}

function copyFileUrl(url) {
  // Provide the absolute URL based on the devserver
  const absUrl = url;
  navigator.clipboard.writeText(absUrl);
  toast('Dateipfad kopiert', 'success');
}

async function deleteFile(filename) {
  if (!confirm(`"${filename}" wirklich löschen?`)) return;
  try {
    await apiFetch(`/api/files/${filename}`, { method: 'DELETE' });
    toast('Datei gelöscht', 'success');
    loadFiles();
  } catch (err) {
    toast(`Fehler: ${err.message}`, 'error');
  }
}

// ══════════════════════════════════════════════════
// AI Toolbar
// ══════════════════════════════════════════════════

function initSidebar() {
  const tabs = document.querySelectorAll('.sidebar-tab');
  const panels = document.querySelectorAll('.sidebar-content');
  const mainSidebar = document.getElementById('sidebar-panel-container');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      // If clicking the active tab, toggle it off (collapse)
      if (tab.classList.contains('active')) {
        tab.classList.remove('active');
        mainSidebar.classList.remove('open');
        return;
      }
      
      // Otherwise, activate this tab
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.add('hidden'));
      
      tab.classList.add('active');
      document.getElementById('tab-' + target).classList.remove('hidden');
      mainSidebar.classList.add('open');
    });
  });

  // Chat logic
  document.getElementById('chat-send').addEventListener('click', sendChat);
  const chatInput = document.getElementById('chat-input');
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChat();
    }
  });
  chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
  });

  // Image logic
  document.getElementById('image-generate').addEventListener('click', generateImage);
  document.getElementById('image-prompt').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateImage(); }
  });

  // Audio logic
  document.getElementById('audio-generate').addEventListener('click', generateAudio);
  document.getElementById('audio-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateAudio(); }
  });
}

// ── Console Listener ───────────────────────────────

function initConsoleListener() {
  const logsContainer = document.getElementById('console-logs');
  const clearBtn = document.getElementById('console-clear');
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      logsContainer.innerHTML = '';
    });
  }

  // Listen for postMessage from the dev-server iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'ESCAPE_PATH_CHANGE') {
      const pathInput = document.getElementById('devserver-path-input');
      if (pathInput) {
        let path = event.data.path;
        if (path.startsWith('/')) path = path.substring(1);
        pathInput.value = path;
      }
    }

    // We only accept messages that look like our console intercepts
    if (event.data && event.data.type === 'console-intercept') {
      const { level, args } = event.data;
      
      const logEl = document.createElement('div');
      logEl.style.padding = '4px 0';
      logEl.style.borderBottom = '1px solid var(--bg-2)';
      
      let color = 'var(--text)';
      if (level === 'error') color = 'var(--danger)';
      if (level === 'warn') color = 'var(--warning)';
      if (level === 'info') color = 'var(--accent)';
      
      logEl.style.color = color;
      
      // Basic formatting of args
      const text = args.map(arg => {
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch { return '[Object]'; }
        }
        return String(arg);
      }).join(' ');

      logEl.textContent = `[${level}] ${text}`;
      
      // Remove placeholder if present
      if (logsContainer.children.length === 1 && logsContainer.children[0].textContent.includes('Lausche')) {
        logsContainer.innerHTML = '';
      }

      logsContainer.appendChild(logEl);
      logsContainer.scrollTop = logsContainer.scrollHeight;
    }
  });
}

// ── Chat ─────────────────────────────────────────

async function sendChat() {
  if (isStreaming) return;

  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  input.style.height = 'auto'; // Reset height after send
  const messages = document.getElementById('chat-messages');
  const empty = messages.querySelector('.empty-state');
  if (empty) empty.remove();

  // Add user message
  chatHistory.push({ role: 'user', content: text });
  messages.innerHTML += `
    <div class="chat-msg user">
      <div class="chat-label">Du</div>
      ${escapeHtml(text)}
    </div>`;

  // Check if new chat needs title
  let title = null;
  if (!currentChatId) {
    currentChatId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    title = text.length > 25 ? text.slice(0, 25) + '…' : text;
    allChats.push({ id: currentChatId, title, messages: [] });
    
    // Add to dropdown
    const select = document.getElementById('chat-session-select');
    select.innerHTML += `<option value="${currentChatId}">${escapeHtml(title)}</option>`;
    select.value = currentChatId;
  }

  // Add to local state
  const activeChat = allChats.find(c => c.id === currentChatId);
  if (activeChat) {
    activeChat.messages.push({ role: 'user', content: text });
  }

  // Persist user msg
  apiFetch('/api/history/chat', { 
    method: 'POST', 
    headers:{'Content-Type':'application/json'}, 
    body: JSON.stringify({ 
      chatId: currentChatId, 
      title: title,
      message: { role: 'user', content: text, timestamp: new Date().toISOString() } 
    }) 
  }).catch(()=>{});

  // Add typing indicator
  const typingId = 'typing-' + Date.now();
  messages.innerHTML += `
    <div class="chat-msg assistant" id="${typingId}">
      <div class="chat-label">AI</div>
      <div class="chat-typing"><span></span><span></span><span></span></div>
    </div>`;
  messages.scrollTop = messages.scrollHeight;

  isStreaming = true;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        model: document.getElementById('chat-model-select').value || 'gpt-4o-mini',
        messages: chatHistory.slice(-20), // Keep last 20 messages
      }),
    });

    if (!res.ok) {
      throw new Error(`Fehler ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    const typingEl = document.getElementById(typingId);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            fullResponse += delta;
            typingEl.innerHTML = `<div class="chat-label">AI</div>${renderMarkdown(fullResponse)}`;
            messages.scrollTop = messages.scrollHeight;
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    if (!fullResponse) {
      typingEl.innerHTML = `<div class="chat-label">AI</div><em style="color:var(--text-muted)">Keine Antwort erhalten</em>`;
    }

    chatHistory.push({ role: 'assistant', content: fullResponse });
    if (activeChat) {
      activeChat.messages.push({ role: 'assistant', content: fullResponse });
    }

    // Persist assistant msg
    apiFetch('/api/history/chat', { 
      method: 'POST', 
      headers:{'Content-Type':'application/json'}, 
      body: JSON.stringify({ 
        chatId: currentChatId,
        message: { role: 'assistant', content: fullResponse, timestamp: new Date().toISOString() } 
      }) 
    }).catch(()=>{});

  } catch (err) {
    const typingEl = document.getElementById(typingId);
    if (typingEl) {
      typingEl.className = 'chat-msg error';
      typingEl.innerHTML = `Fehler: ${err.message}`;
    }
  }

  isStreaming = false;
  messages.scrollTop = messages.scrollHeight;
}

// ── Image generation ─────────────────────────────

async function generateImage() {
  const input = document.getElementById('image-prompt');
  const prompt = input.value.trim();
  if (!prompt) return;

  input.value = '';
  const results = document.getElementById('image-results');
  const size = document.getElementById('image-size').value;

  const loadingId = 'img-' + Date.now();
  const empty = results.querySelector('.empty-state');
  if (empty) empty.remove();
  
  results.innerHTML += `
    <div class="image-result" id="${loadingId}">
      <div style="padding:32px;text-align:center;color:var(--text-muted)">
        <i data-lucide="loader" class="spin" style="width:24px;height:24px"></i>
        <div style="margin-top:8px;font-size:12px">Bild wird generiert…</div>
      </div>
      <div class="image-prompt">${escapeHtml(prompt)}</div>
    </div>`;
  lucide.createIcons();
  results.scrollTop = results.scrollHeight;

  try {
    const model = document.getElementById('image-model-select').value || 'dall-e-3';
    const body = { model, prompt, size, n: 1 };
    if (referenceImages.length > 0) {
      body.reference_images = referenceImages.map(r => r.dataUri);
    }
    const data = await apiFetch('/api/ai/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const el = document.getElementById(loadingId);
    if (data.url) {
      el.innerHTML = `
        <img src="${data.url}" alt="${escapeHtml(prompt)}">
        <div class="image-prompt">${escapeHtml(prompt)}</div>`;
      clearImageReferences();
      loadFiles();
    } else {
      throw new Error('Kein Bild erhalten');
    }
  } catch (err) {
    const el = document.getElementById(loadingId);
    if (el) el.innerHTML = `<div style="color:var(--danger);padding:12px;font-size:13px">Fehler: ${err.message}</div>`;
  }
}

function initImageReference() {
  const area = document.getElementById('image-reference-area');
  area.addEventListener('click', e => {
    if (e.target.closest('.image-reference-btn')) {
      document.getElementById('image-reference-input').click();
    } else if (e.target.closest('.image-reference-remove')) {
      const idx = parseInt(e.target.closest('.image-reference-remove').dataset.index, 10);
      removeReferenceImage(idx);
    }
  });
  area.addEventListener('change', e => {
    if (e.target.id === 'image-reference-input') handleImageReferenceSelected(e);
  });
}

function handleImageReferenceSelected(e) {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  for (const file of files) {
    if (referenceImages.length >= MAX_REFERENCE_IMAGES) {
      showImageReferenceError(`Maximal ${MAX_REFERENCE_IMAGES} Referenzbilder erlaubt.`);
      break;
    }
    if (!file.type.startsWith('image/')) {
      showImageReferenceError('Bitte eine Bilddatei wählen.');
      continue;
    }
    if (file.size > 10 * 1024 * 1024) {
      showImageReferenceError(`„${file.name}" ist zu groß (max. 10 MB).`);
      continue;
    }
    const reader = new FileReader();
    reader.onload = () => {
      referenceImages.push({ dataUri: reader.result, name: file.name });
      renderImageReferences();
    };
    reader.onerror = () => showImageReferenceError(`„${file.name}" konnte nicht gelesen werden.`);
    reader.readAsDataURL(file);
  }
  e.target.value = '';
}

function renderImageReferences() {
  const area = document.getElementById('image-reference-area');
  const thumbsHtml = referenceImages.map((ref, i) => `
    <div class="image-reference-thumb-wrap">
      <img class="image-reference-thumb" src="${ref.dataUri}" alt="Referenz ${i + 1}">
      <button class="image-reference-remove" data-index="${i}" title="Entfernen">
        <i data-lucide="x"></i>
      </button>
    </div>
  `).join('');
  const buttonHtml = referenceImages.length < MAX_REFERENCE_IMAGES
    ? `<button class="image-reference-btn" title="Referenzbild hinzufügen">
         <i data-lucide="image-plus"></i>
         <span>Referenzbild</span>
       </button>`
    : '';
  area.innerHTML = thumbsHtml + buttonHtml +
    `<input type="file" id="image-reference-input" accept="image/*" multiple hidden>`;
  lucide.createIcons();
}

function removeReferenceImage(index) {
  referenceImages.splice(index, 1);
  renderImageReferences();
}

function clearImageReferences() {
  referenceImages = [];
  renderImageReferences();
}

function showImageReferenceError(msg) {
  const area = document.getElementById('image-reference-area');
  area.querySelectorAll('.image-reference-error').forEach(n => n.remove());
  const el = document.createElement('div');
  el.className = 'image-reference-error';
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── Audio generation ─────────────────────────────

async function generateAudio() {
  const input = document.getElementById('audio-text');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  const results = document.getElementById('audio-results');
  const voice = document.getElementById('audio-voice').value;

  const loadingId = 'aud-' + Date.now();
  const empty = results.querySelector('.empty-state');
  if (empty) empty.remove();

  results.innerHTML += `
    <div class="audio-result" id="${loadingId}">
      <div class="audio-prompt">${escapeHtml(text.slice(0, 100))}${text.length > 100 ? '…' : ''}</div>
      <div style="padding:12px;text-align:center;color:var(--text-muted)">
        <i data-lucide="loader" class="spin" style="width:18px;height:18px"></i>
      </div>
    </div>`;
  lucide.createIcons();
  results.scrollTop = results.scrollHeight;

  try {
    const model = document.getElementById('audio-model-select').value || 'tts-1';
    const data = await apiFetch('/api/ai/audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, input: text, voice }),
    });

    document.getElementById(loadingId).innerHTML = `
      <div class="audio-prompt">${escapeHtml(text.slice(0, 100))}${text.length > 100 ? '…' : ''}</div>
      <audio controls src="${data.url}"></audio>`;
      
    // Reload files since it was auto-saved
    loadFiles();
  } catch (err) {
    const el = document.getElementById(loadingId);
    if (el) el.innerHTML = `<div style="color:var(--danger);font-size:13px">Fehler: ${err.message}</div>`;
  }
}

// ── History ──────────────────────────────────────────────

async function loadHistory() {
  try {
    const data = await apiFetch('/api/history');
    allChats = data.chats || [];
    
    // Populate chat dropdown
    const select = document.getElementById('chat-session-select');
    select.innerHTML = '';
    
    if (allChats.length > 0) {
      allChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      for (const c of allChats) {
        select.innerHTML += `<option value="${c.id}">${escapeHtml(c.title)}</option>`;
      }
      currentChatId = allChats[0].id;
      select.value = currentChatId;
      renderChatSession(currentChatId);
    } else {
      currentChatId = null;
      document.getElementById('chat-messages').innerHTML = `
        <div class="empty-state">
          <i data-lucide="message-square"></i>
          <p>Keine Chats</p>
          <span>Schreibe eine Nachricht, um eine Unterhaltung zu beginnen.</span>
        </div>`;
      lucide.createIcons();
      chatHistory = [];
    }

    // Dropdown change listener
    select.onchange = (e) => {
      currentChatId = e.target.value;
      renderChatSession(currentChatId);
    };

    // New chat button
    document.getElementById('chat-new-btn').onclick = () => {
      currentChatId = null;
      select.value = ""; // Deselect
      document.getElementById('chat-messages').innerHTML = `
        <div class="empty-state">
          <i data-lucide="message-square"></i>
          <p>Neuer Chat</p>
          <span>Schreibe eine Nachricht, um eine neue Unterhaltung zu beginnen.</span>
        </div>`;
      lucide.createIcons();
      chatHistory = [];
    };

    // Menu button toggle
    const menuBtn = document.getElementById('chat-menu-btn');
    const menuDropdown = document.getElementById('chat-menu-dropdown');
    menuBtn.onclick = (e) => {
      e.stopPropagation();
      menuDropdown.classList.toggle('show');
    };

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!menuDropdown.contains(e.target) && e.target !== menuBtn) {
        menuDropdown.classList.remove('show');
      }
    });

    // Rename button
    document.getElementById('chat-rename-btn').onclick = async () => {
      menuDropdown.classList.remove('show');
      if (!currentChatId) return;
      const chat = allChats.find(c => c.id === currentChatId);
      if (!chat) return;
      
      const newTitle = prompt('Neuer Name für den Chat:', chat.title);
      if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        // update UI dropdown option
        const option = select.querySelector(`option[value="${currentChatId}"]`);
        if (option) option.textContent = chat.title;
        
        await apiFetch(`/api/history/chat/${currentChatId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: chat.title })
        }).catch(()=>{});
      }
    };

    // Delete button
    document.getElementById('chat-delete-btn').onclick = async () => {
      menuDropdown.classList.remove('show');
      if (!currentChatId) return;
      if (!confirm('Diesen Chat wirklich löschen?')) return;

      await apiFetch(`/api/history/chat/${currentChatId}`, { method: 'DELETE' }).catch(()=>{});
      
      allChats = allChats.filter(c => c.id !== currentChatId);
      const option = select.querySelector(`option[value="${currentChatId}"]`);
      if (option) option.remove();

      if (allChats.length > 0) {
        currentChatId = allChats[0].id;
        select.value = currentChatId;
        renderChatSession(currentChatId);
      } else {
        currentChatId = null;
        document.getElementById('chat-messages').innerHTML = `
          <div class="empty-state">
            <i data-lucide="message-square"></i>
            <p>Keine Chats</p>
            <span>Schreibe eine Nachricht, um eine Unterhaltung zu beginnen.</span>
          </div>`;
        lucide.createIcons();
        chatHistory = [];
      }
    };

    // Load Generations
    const imgContainer = document.getElementById('image-results');
    const audContainer = document.getElementById('audio-results');
    imgContainer.innerHTML = '';
    audContainer.innerHTML = '';
    
    let hasImage = false;
    let hasAudio = false;
    
    if (data.generations && data.generations.length > 0) {
      for (const gen of data.generations) {
        if (gen.type === 'image') {
          hasImage = true;
          imgContainer.innerHTML += `
            <div class="image-result">
              <img src="${gen.url}" alt="${escapeHtml(gen.prompt)}">
              <div class="image-prompt">${escapeHtml(gen.prompt)}</div>
            </div>`;
        } else if (gen.type === 'audio') {
          hasAudio = true;
          audContainer.innerHTML += `
            <div class="audio-result">
              <div class="audio-prompt">${escapeHtml(gen.prompt.slice(0, 100))}${gen.prompt.length > 100 ? '…' : ''}</div>
              <audio controls src="${gen.url}"></audio>
            </div>`;
        }
      }
      imgContainer.scrollTop = imgContainer.scrollHeight;
      audContainer.scrollTop = audContainer.scrollHeight;
    }

    if (!hasImage) {
      imgContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="image-plus"></i>
          <p>Keine Bilder generiert</p>
          <span>Beschreibe ein Bild, um es per AI erstellen zu lassen.</span>
        </div>`;
    }
    if (!hasAudio) {
      audContainer.innerHTML = `
        <div class="empty-state">
          <i data-lucide="mic"></i>
          <p>Keine Audios generiert</p>
          <span>Gib einen Text ein, um eine Sprachausgabe zu erzeugen.</span>
        </div>`;
    }
    lucide.createIcons();
  } catch (err) {
    console.error('Fehler beim Laden des Verlaufs:', err);
  }
}

function renderChatSession(id) {
  const msgContainer = document.getElementById('chat-messages');
  msgContainer.innerHTML = '';
  chatHistory = [];
  
  const chat = allChats.find(c => c.id === id);
  if (chat && chat.messages && chat.messages.length > 0) {
    for (const msg of chat.messages) {
      chatHistory.push({ role: msg.role, content: msg.content });
      msgContainer.innerHTML += `
        <div class="chat-msg ${msg.role}">
          <div class="chat-label">${msg.role === 'user' ? 'Du' : 'AI'}</div>
          ${msg.role === 'user' ? escapeHtml(msg.content) : renderMarkdown(msg.content)}
        </div>`;
    }
    msgContainer.scrollTop = msgContainer.scrollHeight;
  } else {
    msgContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="message-square"></i>
        <p>Neuer Chat</p>
        <span>Schreibe eine Nachricht, um eine Unterhaltung zu beginnen.</span>
      </div>`;
    lucide.createIcons();
  }
}

// ══════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: authHeader,
      ...(opts.headers || {}),
    },
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error || msg;
    } catch {}
    throw new Error(msg);
  }

  return res.json();
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderMarkdown(text) {
  try {
    let html = marked.parse(text, { breaks: true, gfm: true });
    return html.replace(/<a href="/g, '<a target="_blank" style="color:var(--accent); text-decoration:underline; font-weight:500;" href="');
  } catch {
    return escapeHtml(text);
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function toast(message, type = '') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = '0.3s';
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// ══════════════════════════════════════════════════
// Global Chat
// ══════════════════════════════════════════════════
let globalChatInterval = null;
let lastGlobalChatIds = new Set();

function initGlobalChat() {
  if (globalChatInterval) clearInterval(globalChatInterval);
  
  if (!document.getElementById('global-chat-styles')) {
    const style = document.createElement('style');
    style.id = 'global-chat-styles';
    style.innerHTML = `.mention-item:hover, .mention-item.active { background: var(--bg-2) !important; }`;
    document.head.appendChild(style);
  }

  // Check if tab is active
  const chatTabBtn = document.querySelector('.sidebar-tab[data-tab="chat"]');
  chatTabBtn.addEventListener('click', () => {
    setTimeout(() => {
      const tabChat = document.getElementById('tab-chat');
      const sidebarContainer = document.getElementById('sidebar-panel-container');
      const isChatOpen = !tabChat.classList.contains('hidden') && sidebarContainer.classList.contains('open');
      
      if (isChatOpen) {
        document.getElementById('global-chat-badge').classList.add('hidden');
        const container = document.getElementById('global-chat-messages');
        container.scrollTop = container.scrollHeight;
        
        if (lastGlobalChatIds.size > 0) {
          const arr = Array.from(lastGlobalChatIds);
          localStorage.setItem('globalChatLastRead', arr[arr.length - 1]);
        }
      }
    }, 50);
  });

  const fetchGlobalChat = async () => {
    try {
      const res = await apiFetch('/api/global-chat');
      const messages = res.messages || [];
      const container = document.getElementById('global-chat-messages');
      const tabChat = document.getElementById('tab-chat');
      const sidebarContainer = document.getElementById('sidebar-panel-container');
      const isChatOpen = !tabChat.classList.contains('hidden') && sidebarContainer.classList.contains('open');
      
      let newMessages = false;
      let lastReadMessageId = localStorage.getItem('globalChatLastRead') || null;
      
      let isFirstLoad = lastGlobalChatIds.size === 0;
      messages.forEach(m => {
        if (!lastGlobalChatIds.has(m.id)) {
          newMessages = true;
          lastGlobalChatIds.add(m.id);
        }
        renderGlobalMessage(m, container);
      });

      if (isFirstLoad) {
        container.scrollTop = container.scrollHeight;
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.team !== config.name && lastMsg.id !== lastReadMessageId) {
            if (!isChatOpen) document.getElementById('global-chat-badge').classList.remove('hidden');
          }
        }
      } else if (newMessages) {
        container.scrollTop = container.scrollHeight;
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.team !== config.name) {
          if (!isChatOpen) document.getElementById('global-chat-badge').classList.remove('hidden');
        }
      }
      
      if (isChatOpen && messages.length > 0) {
         document.getElementById('global-chat-badge').classList.add('hidden');
         localStorage.setItem('globalChatLastRead', messages[messages.length - 1].id);
      }
    } catch (err) {
      console.error('Global Chat Fetch Error:', err);
    }
  };

  fetchGlobalChat();
  globalChatInterval = setInterval(fetchGlobalChat, 10000);
  window.addEventListener('globalChatUpdate', fetchGlobalChat);

  const sendBtn = document.getElementById('global-chat-send');
  const input = document.getElementById('global-chat-input');
  
  let globalChatReplyTo = null;
  let globalChatAttachments = [];
  
  const replyEl = document.getElementById('global-chat-reply');
  const replyTextEl = document.getElementById('global-chat-reply-text');
  const replyCancelBtn = document.getElementById('global-chat-reply-cancel');
  const attachEl = document.getElementById('global-chat-attachments');

  const pollCreator = document.getElementById('global-chat-poll-creator');
  const pollCloseBtn = document.getElementById('poll-creator-close');
  const pollAddOptBtn = document.getElementById('poll-creator-add-opt');
  const pollSendBtn = document.getElementById('poll-creator-send');
  const pollOptionsDiv = document.getElementById('poll-creator-options');
  const pollQuestionInput = document.getElementById('poll-creator-question');

  pollCloseBtn.onclick = () => pollCreator.classList.add('hidden');

  pollAddOptBtn.onclick = () => {
    const optsCount = pollOptionsDiv.querySelectorAll('.poll-opt').length + 1;
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'poll-opt';
    inp.placeholder = `Option ${optsCount}`;
    inp.style.cssText = 'width: 100%; background: var(--bg-2); border: 1px solid var(--border); padding: 6px 8px; border-radius: 6px; color: var(--text); font-size: 13px; outline: none; margin-top: 6px;';
    pollOptionsDiv.appendChild(inp);
  };

  pollSendBtn.onclick = async () => {
    const q = pollQuestionInput.value.trim();
    if (!q) return;
    const opts = Array.from(pollOptionsDiv.querySelectorAll('.poll-opt')).map(inp => inp.value.trim()).filter(v => v);
    if (opts.length < 2) {
      toast('Mindestens 2 Optionen benötigt', 'error');
      return;
    }
    const poll = { question: q, options: opts.map(o => ({ text: o, votes: [] })) };
    pollCreator.classList.add('hidden');
    pollQuestionInput.value = '';
    pollOptionsDiv.innerHTML = `
      <input type="text" class="poll-opt" placeholder="Option 1" style="width: 100%; background: var(--bg-2); border: 1px solid var(--border); padding: 6px 8px; border-radius: 6px; color: var(--text); font-size: 13px; outline: none;">
      <input type="text" class="poll-opt" placeholder="Option 2" style="width: 100%; background: var(--bg-2); border: 1px solid var(--border); padding: 6px 8px; border-radius: 6px; color: var(--text); font-size: 13px; outline: none; margin-top: 6px;">
    `;
    input.value = '';
    try {
      await apiFetch('/api/global-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: '', attachments: [], replyTo: null, poll })
      });
      fetchGlobalChat();
    } catch(err) {
      toast('Fehler beim Senden', 'error');
    }
  };
  


  window.setGlobalChatReply = (id, text) => {
    globalChatReplyTo = id;
    replyTextEl.textContent = `Antwort auf: ${text.slice(0, 30)}...`;
    replyEl.classList.remove('hidden');
    input.focus();
  };
  
  replyCancelBtn.onclick = () => {
    globalChatReplyTo = null;
    replyEl.classList.add('hidden');
  };

  input.addEventListener('paste', async (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        e.preventDefault();
        const file = item.getAsFile();
        const form = new FormData();
        form.append('file', file);
        try {
          const res = await fetch('/api/upload', {
             method: 'POST',
             headers: { Authorization: authHeader },
             body: form
          });
          if (res.ok) {
            const data = await res.json();
            globalChatAttachments.push(data.url);
            renderAttachments();
          }
        } catch(err) {
          toast('Bild-Upload fehlgeschlagen', 'error');
        }
      }
    }
  });

  function renderAttachments() {
    if (globalChatAttachments.length === 0) {
      attachEl.classList.add('hidden');
      attachEl.innerHTML = '';
      return;
    }
    attachEl.classList.remove('hidden');
    attachEl.innerHTML = globalChatAttachments.map((url, i) => `
      <div style="position:relative; width:60px; height:60px; border-radius:8px; overflow:hidden; border:1px solid var(--border);">
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;">
        <button class="btn-ghost" style="position:absolute; top:2px; right:2px; padding:2px; background:rgba(0,0,0,0.5); border-radius:4px;" onclick="window.removeAttachment(${i})">
          <i data-lucide="x" style="width:12px; height:12px; color:white;"></i>
        </button>
      </div>
    `).join('');
    lucide.createIcons();
  }

  window.removeAttachment = (i) => {
    globalChatAttachments.splice(i, 1);
    renderAttachments();
  };

  const sendGlobal = async () => {
    let text = input.value.trim();
    let poll = null;
    let todo = null;
    let dice = null;
    
    if (text.startsWith('/poll ')) {
      const parts = text.substring(text.indexOf(' ')+1).split('|').map(s=>s.trim());
      if (parts.length > 1) {
        poll = {
          question: parts[0],
          options: parts.slice(1).map(o => ({ text: o, votes: [] }))
        };
        text = ''; 
      }
    } else if (text.startsWith('/todo ')) {
      todo = { checked: false, text: text.slice(6).trim() };
      if (!todo.text) return;
      text = '';
    } else if (text.startsWith('/dice')) {
      const parts = text.split(' ');
      const max = parseInt(parts[1]) || 100;
      const result = Math.floor(Math.random() * max) + 1;
      dice = { result, max };
      text = '';
    }

    if (!text && globalChatAttachments.length === 0 && !poll && !todo && !dice) return;

    input.value = '';
    input.style.height = 'auto';
    closeAutocomplete();
    if (replyCancelBtn) replyCancelBtn.click();
    
    const atts = [...globalChatAttachments];
    globalChatAttachments = [];
    renderAttachments();
    
    try {
      await apiFetch('/api/global-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           text, 
           attachments: atts, 
           replyTo: globalChatReplyTo,
           poll,
           todo,
           dice
        })
      });
      fetchGlobalChat();
    } catch(err) {
      toast('Fehler beim Senden', 'error');
    }
  };

  sendBtn.onclick = sendGlobal;
  
  const autocompleteBox = document.getElementById('mention-autocomplete');
  let currentMentionSearch = null;
  
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = (input.scrollHeight) + 'px';

    const val = input.value;
    const cursor = input.selectionStart;
    const textBefore = val.slice(0, cursor);
    
    const match = textBefore.match(/@([a-zA-Z0-9_-äöüÄÖÜß]*)$/);
    if (match) {
      currentMentionSearch = match[1].toLowerCase();
      showAutocomplete(currentMentionSearch, cursor - match[1].length - 1);
    } else if (textBefore.startsWith('/')) {
      const cmd = textBefore.toLowerCase();
      const commands = [
        { id: '/poll', icon: 'bar-chart-2', desc: 'Umfrage erstellen', action: "document.getElementById('global-chat-poll-creator').classList.remove('hidden'); document.getElementById('global-chat-input').value=''; document.getElementById('mention-autocomplete').classList.add('hidden');" },
        { id: '/todo ', icon: 'check-square', desc: 'Aufgabe erstellen', action: "document.getElementById('global-chat-input').value='/todo '; document.getElementById('global-chat-input').focus(); document.getElementById('mention-autocomplete').classList.add('hidden');" },
        { id: '/dice ', icon: 'dices', desc: 'Würfeln (1-100)', action: "document.getElementById('global-chat-input').value='/dice '; document.getElementById('global-chat-input').focus(); document.getElementById('mention-autocomplete').classList.add('hidden');" }
      ];
      
      const filtered = commands.filter(c => c.id.startsWith(cmd) || cmd === '/');
      if (filtered.length > 0) {
        autocompleteBox.innerHTML = filtered.map((c, i) => `
          <div class="mention-item ${i === 0 ? 'active' : ''}" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border); font-size:13px;" onclick="${c.action}">
            <span style="font-weight:600;"><i data-lucide="${c.icon}" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i> ${c.id.trim()}</span> <span style="color:var(--text-muted); font-size:11px;">${c.desc}</span>
          </div>
        `).join('');
        autocompleteBox.classList.remove('hidden');
        lucide.createIcons();
      } else {
        closeAutocomplete();
      }
    } else {
      closeAutocomplete();
    }
  });

  input.onkeydown = (e) => {
    if (!autocompleteBox.classList.contains('hidden')) {
      const items = autocompleteBox.querySelectorAll('.mention-item');
      let activeIdx = Array.from(items).findIndex(i => i.classList.contains('active'));
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIdx < items.length - 1) {
          if (activeIdx >= 0) items[activeIdx].classList.remove('active');
          items[activeIdx + 1].classList.add('active');
          items[activeIdx + 1].scrollIntoView({ block: 'nearest' });
        }
        return;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIdx > 0) {
          items[activeIdx].classList.remove('active');
          items[activeIdx - 1].classList.add('active');
          items[activeIdx - 1].scrollIntoView({ block: 'nearest' });
        }
        return;
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (activeIdx >= 0) {
          e.preventDefault();
          items[activeIdx].click();
          return;
        }
      } else if (e.key === 'Escape') {
        closeAutocomplete();
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendGlobal();
    }
  };

  function showAutocomplete(search, startIndex) {
    if (!config || !config.all_teams) return;
    const matches = config.all_teams.filter(t => 
      t.name !== config.name && 
      (t.username.toLowerCase().includes(search) || t.name.toLowerCase().includes(search))
    );
    if (matches.length === 0) {
      closeAutocomplete();
      return;
    }
    
    autocompleteBox.innerHTML = matches.map((t, i) => `
      <div class="mention-item ${i === 0 ? 'active' : ''}" style="padding:8px 12px; cursor:pointer; border-bottom:1px solid var(--border); font-size:13px;" data-username="${escapeHtml(t.username)}">
        <span style="font-weight:600;">@${escapeHtml(t.username)}</span> <span style="color:var(--text-muted); font-size:11px; margin-left:6px;">${escapeHtml(t.name)}</span>
      </div>
    `).join('');
    
    autocompleteBox.classList.remove('hidden');
    
    autocompleteBox.querySelectorAll('.mention-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        autocompleteBox.querySelectorAll('.mention-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
      item.addEventListener('click', () => {
        const username = item.dataset.username;
        const val = input.value;
        const before = val.slice(0, startIndex);
        const after = val.slice(input.selectionStart);
        input.value = before + '@' + username + ' ' + after;
        input.focus();
        closeAutocomplete();
      });
    });
  }
  
  function closeAutocomplete() {
    autocompleteBox.classList.add('hidden');
    autocompleteBox.innerHTML = '';
  }
}

window.toggleReaction = async (msgId, emoji) => {
  try {
    await apiFetch(`/api/global-chat/${msgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: emoji })
    });
    window.dispatchEvent(new CustomEvent('globalChatUpdate'));
  } catch(e) {}
};

window.votePoll = async (msgId, optionIndex) => {
  try {
    await apiFetch(`/api/global-chat/${msgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollVote: optionIndex })
    });
    window.dispatchEvent(new CustomEvent('globalChatUpdate'));
  } catch(e) {}
};

window.toggleTodo = async (msgId) => {
  try {
    await apiFetch(`/api/global-chat/${msgId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todoToggle: true })
    });
    window.dispatchEvent(new CustomEvent('globalChatUpdate'));
  } catch(e) {}
};

function renderGlobalMessage(msg, container) {
  const isMe = msg.team === config.name;
  let textHtml = '';
  
  if (msg.text) {
    let safeText = escapeHtml(msg.text);
    const highlightColor = isMe ? '#fff' : 'var(--accent)';
    safeText = safeText.replace(/@([a-zA-Z0-9_-äöüÄÖÜß]+)/g, (match, p1) => {
       const isTeam = config && config.all_teams && config.all_teams.some(t => t.username === p1 || t.name === p1);
       if (isTeam) return `<span style="color:${highlightColor};font-weight:700;">@${escapeHtml(p1)}</span>`;
       return match;
    });
    textHtml = renderMarkdown(safeText);
  }

  let attachmentsHtml = '';
  if (msg.attachments && msg.attachments.length > 0) {
    attachmentsHtml = `<div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">` + 
      msg.attachments.map(url => `<a href="${url}" target="_blank"><img src="${url}" style="max-width:200px; max-height:200px; border-radius:8px; border:1px solid var(--border); object-fit:cover;"></a>`).join('') +
      `</div>`;
  }

  let replyHtml = '';
  if (msg.replyTo) {
     replyHtml = `<div style="font-size:11px; color:var(--text-muted); margin-bottom:4px; border-left:2px solid var(--border); padding-left:6px;"><i data-lucide="corner-down-right" style="width:10px; height:10px; display:inline-block; margin-right:4px;"></i>Antwort</div>`;
  }

  let pollHtml = '';
  if (msg.poll) {
    pollHtml = `<div style="background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius); padding:12px; margin-top:8px;">
      <div style="font-weight:600; margin-bottom:8px;"><i data-lucide="bar-chart-2" style="width:14px; height:14px; margin-right:6px; display:inline-block;"></i>${escapeHtml(msg.poll.question)}</div>
      <div style="display:flex; flex-direction:column; gap:6px;">
        ${msg.poll.options.map((opt, idx) => {
          const voteCount = opt.votes ? opt.votes.length : 0;
          const hasVoted = opt.votes && opt.votes.includes(config.name);
          return `
            <div class="poll-opt-hover" onclick="window.votePoll('${msg.id}', ${idx})" style="display:flex; justify-content:space-between; align-items:center; background:${hasVoted ? 'var(--accent-bg)' : 'var(--bg-2)'}; padding:8px 12px; border-radius:6px; cursor:pointer; border:1px solid ${hasVoted ? 'var(--accent)' : 'var(--border)'}; font-size:13px; transition:all 0.2s;">
              <span>${escapeHtml(opt.text)}</span>
              <span style="font-weight:600; color:var(--text-muted);">${voteCount}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }

  let todoHtml = '';
  if (msg.todo) {
    todoHtml = `
      <div class="todo-hover" style="background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius); padding:10px 12px; margin-top:8px; display:flex; align-items:center; gap:10px; cursor:pointer; transition:all 0.2s;" onclick="window.toggleTodo('${msg.id}')">
        <div style="width:18px; height:18px; border-radius:4px; border:2px solid ${msg.todo.checked ? 'var(--success)' : 'var(--border)'}; background:${msg.todo.checked ? 'var(--success)' : 'transparent'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          ${msg.todo.checked ? `<i data-lucide="check" style="width:12px; height:12px; color:white;"></i>` : ''}
        </div>
        <div style="font-size:13px; font-weight:500; color:${msg.todo.checked ? 'var(--text-muted)' : 'var(--text)'}; text-decoration:${msg.todo.checked ? 'line-through' : 'none'}; word-break:break-word;">${escapeHtml(msg.todo.text)}</div>
      </div>
    `;
  }

  let diceHtml = '';
  if (msg.dice) {
    diceHtml = `
      <div style="background:var(--bg-1); border:1px solid var(--border); border-radius:var(--radius); padding:10px 12px; margin-top:8px; display:flex; align-items:center; gap:10px;">
        <div style="background:var(--accent-bg); padding:6px; border-radius:8px; display:flex; align-items:center; justify-content:center;">
          <i data-lucide="dices" style="width:18px; height:18px; color:var(--accent);"></i>
        </div>
        <div style="font-size:13px;">Würfelt (1-${msg.dice.max}): <strong style="font-size:16px; color:var(--text); margin-left:4px;">${msg.dice.result}</strong></div>
      </div>
    `;
  }

  let reactionsHtml = '';
  if (msg.reactions && Object.keys(msg.reactions).length > 0) {
    reactionsHtml = `<div style="display:flex; gap:4px; margin-top:8px; flex-wrap:wrap;">`;
    for (const [emoji, teams] of Object.entries(msg.reactions)) {
      if (teams.length > 0) {
        const hasReacted = teams.includes(config.name);
        reactionsHtml += `<button class="chat-interactable" onclick="window.toggleReaction('${msg.id}', '${emoji}')" style="background:${hasReacted ? 'var(--accent-bg)' : 'var(--bg-2)'}; border:1px solid ${hasReacted ? 'var(--accent)' : 'var(--border)'}; border-radius:12px; padding:2px 8px; font-size:12px; display:flex; align-items:center; gap:4px; cursor:pointer; color:var(--text); transition:all 0.2s;">${emoji} <span>${teams.length}</span></button>`;
      }
    }
    reactionsHtml += `</div>`;
  }

  const actionsHtml = `
    <div class="chat-actions" style="display:flex; gap:4px; margin-top:8px; opacity:0; transition:opacity 0.2s; position:absolute; right:10px; bottom:-14px; background:var(--bg-1); border:1px solid var(--border); border-radius:16px; padding:2px; box-shadow:var(--shadow); z-index:10;">
      <button class="btn-ghost btn-sm" onclick="window.setGlobalChatReply('${msg.id}', '${escapeHtml((msg.text||'').replace(/'/g,"\\'").replace(/\\n/g, ' '))}')" title="Antworten"><i data-lucide="reply" style="width:14px; height:14px;"></i></button>
      <button class="btn-ghost btn-sm" onclick="window.toggleReaction('${msg.id}', '👍')" title="Daumen hoch">👍</button>
      <button class="btn-ghost btn-sm" onclick="window.toggleReaction('${msg.id}', '🚀')" title="Rakete">🚀</button>
      <button class="btn-ghost btn-sm" onclick="window.toggleReaction('${msg.id}', '👀')" title="Gesehen">👀</button>
      ${msg.text ? `<button class="btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${escapeHtml((msg.text||'').replace(/'/g,"\\'").replace(/\n/g, '\\n'))}'); toast('Text kopiert', 'success');" title="Text kopieren"><i data-lucide="copy" style="width:14px; height:14px;"></i></button>` : ''}
    </div>
  `;

  const msgString = JSON.stringify(msg);
  let div = document.getElementById('msg-' + msg.id);
  let isNew = false;
  
  if (!div) {
    isNew = true;
    div = document.createElement('div');
    div.id = 'msg-' + msg.id;
    div.className = `chat-msg ${isMe ? 'user' : 'assistant'}`; 
    div.style.position = 'relative';
    div.onmouseenter = () => { const a = div.querySelector('.chat-actions'); if(a) a.style.opacity = '1'; };
    div.onmouseleave = () => { const a = div.querySelector('.chat-actions'); if(a) a.style.opacity = '0'; };
  } else {
    if (div.dataset.msg === msgString) return;
  }
  
  div.dataset.msg = msgString;
  div.innerHTML = `
    <div class="chat-label" style="font-size:11px;${isMe ? 'color:rgba(255,255,255,0.7);' : ''}">${escapeHtml(msg.team)} <span style="margin-left:8px;${isMe ? 'color:rgba(255,255,255,0.5);' : 'color:var(--text-muted);'}">${new Date(msg.timestamp).toLocaleTimeString()}</span></div>
    ${replyHtml}
    ${textHtml ? `<div style="font-size:13px;line-height:1.4;" class="markdown-body">${textHtml}</div>` : ''}
    ${attachmentsHtml}
    ${pollHtml}
    ${todoHtml}
    ${diceHtml}
    ${reactionsHtml}
    ${actionsHtml}
  `;
  
  if (isNew) {
    container.appendChild(div);
  }
  lucide.createIcons({ root: div });
}


