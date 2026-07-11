import express from 'express';
import multer from 'multer';
import { readFileSync, readdirSync, unlinkSync, mkdirSync, existsSync, statSync, watch } from 'fs';
import { parse } from 'yaml';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import QRCode from 'qrcode';
import { networkInterfaces } from 'os';

function getLocalIp() {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const configPath = path.join(__dirname, 'teams.yaml');
let configCache = parse(readFileSync(configPath, 'utf8'));

watch(configPath, () => {
  try {
    configCache = parse(readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('Fehler beim Neuladen der teams.yaml:', err.message);
  }
});

function getConfig() {
  return configCache;
}
const UPLOAD_DIR = path.resolve(__dirname, '..', 'public', 'uploads');
const DATA_DIR = path.resolve(__dirname, 'data');

// Ensure directories exist
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

function getHistoryPath(teamName) {
  return path.join(DATA_DIR, `${teamPrefix(teamName)}_history.json`);
}

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded files
app.use('/uploads', express.static(UPLOAD_DIR));

// ── Auth middleware ──────────────────────────────────────────────────
function authenticate(req, res, next) {
  let authHeader = req.headers.authorization;
  
  // Also allow auth via cookie if no header is present
  if (!authHeader && req.cookies && req.cookies.auth) {
    authHeader = req.cookies.auth;
  }

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentifizierung erforderlich' });
  }

  const decoded = Buffer.from(authHeader.slice(6), 'base64').toString();
  const colonIdx = decoded.indexOf(':');
  if (colonIdx === -1) return res.status(401).json({ error: 'Ungültiges Auth-Format' });

  const username = decoded.slice(0, colonIdx);
  const password = decoded.slice(colonIdx + 1);
  const team = getConfig().teams.find(t => t.username === username && t.password === password);

  if (!team) {
    return res.status(401).json({ error: 'Falsche Anmeldedaten' });
  }

  req.team = team;
  next();
}

// ── MIME whitelist ───────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif', 'image/bmp',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/aac', 'audio/flac',
]);

// ── Multer config ───────────────────────────────────────────────────
function teamPrefix(teamName) {
  return teamName.toLowerCase().replace(/[^a-z0-9äöüß]/g, '').replace(/[äöüß]/g, m => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' })[m]);
}

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${teamPrefix(req.team.name)}-${uuidv4().slice(0, 8)}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Dateityp nicht erlaubt: ${file.mimetype}`));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }
});

// ── Routes ──────────────────────────────────────────────────────────

// Team config (non-secret)
app.get('/api/config', authenticate, (req, res) => {
  res.json({
    name: req.team.name,
    username: req.team.username,
    devserver_url: req.team.devserver_url,
    opencode_url: req.team.opencode_url,
    vscode_url: req.team.vscode_url,
    local_ip: getLocalIp(),
    llms: getConfig().llms || { chat: ['gpt-4o-mini'], image: ['dall-e-3'], audio: ['tts-1'] },
    all_teams: (getConfig().teams || []).map(t => ({ name: t.name, username: t.username }))
  });
});

// Caddy Forward Auth Endpoint
app.get('/api/auth', authenticate, (req, res) => {
  // Determine which host the user is trying to access
  const targetHost = req.headers['x-forwarded-host'] || req.headers.host || '';
  const subdomain = targetHost.split('.')[0];
  
  const team = req.team;
  
  // Extract assigned ports for this team
  const extractPort = (url) => {
    if (!url) return null;
    const match = url.match(/https?:\/\/([0-9]+)\./);
    return match ? match[1] : null;
  };

  const devPort = extractPort(team.devserver_url);
  const codePort = extractPort(team.opencode_url);
  const vsPort = extractPort(team.vscode_url);

  // If the target subdomain matches any of the team's assigned ports
  if (subdomain === devPort || subdomain === codePort || subdomain === vsPort) {
    return res.status(200).send('OK');
  }

  // Otherwise, deny access
  return res.status(403).send('Forbidden: Zugriff auf Instanzen anderer Teams nicht erlaubt.');
});

app.get('/api/qr', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).send('Missing url');
    const buffer = await QRCode.toBuffer(url, { width: 300, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    res.setHeader('Content-Type', 'image/png');
    res.send(buffer);
  } catch (err) {
    res.status(500).send('Failed to generate QR');
  }
});

// File upload
app.post('/api/upload', authenticate, (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Keine Datei hochgeladen' });
    }
    res.json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    });
  });
});

// List team's files
app.get('/api/files', authenticate, (req, res) => {
  const prefix = teamPrefix(req.team.name) + '-';
  try {
    const files = readdirSync(UPLOAD_DIR)
      .filter(f => f.startsWith(prefix))
      .map(f => {
        const stat = statSync(path.join(UPLOAD_DIR, f));
        const ext = path.extname(f).toLowerCase();
        let type = 'other';
        if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif', '.bmp'].includes(ext)) type = 'image';
        else if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) type = 'video';
        else if (['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a'].includes(ext)) type = 'audio';
        return { filename: f, size: stat.size, created: stat.birthtime, url: `/uploads/${f}`, type };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(files);
  } catch {
    res.json([]);
  }
});

// Delete file
app.delete('/api/files/:filename', authenticate, (req, res) => {
  const prefix = teamPrefix(req.team.name) + '-';
  const { filename } = req.params;

  if (!filename.startsWith(prefix)) {
    return res.status(403).json({ error: 'Zugriff verweigert' });
  }
  // Prevent path traversal
  if (filename.includes('/') || filename.includes('..')) {
    return res.status(400).json({ error: 'Ungültiger Dateiname' });
  }

  const filepath = path.join(UPLOAD_DIR, filename);
  if (!existsSync(filepath)) {
    return res.status(404).json({ error: 'Datei nicht gefunden' });
  }

  unlinkSync(filepath);
  res.json({ success: true });
});

// ── Chat & Generation History ────────────────────────────────────────

function migrateHistoryData(data) {
  // If data has `chat` (old array format), migrate it to `chats`
  if (data.chat && Array.isArray(data.chat)) {
    data.chats = [{
      id: 'default',
      title: 'Alter Chat',
      messages: data.chat,
      updatedAt: new Date().toISOString()
    }];
    delete data.chat;
  }
  if (!data.chats) data.chats = [];
  if (!data.generations) data.generations = [];
  return data;
}

app.get('/api/history', authenticate, (req, res) => {
  const hp = getHistoryPath(req.team.name);
  if (!existsSync(hp)) {
    return res.json({ chats: [], generations: [] });
  }
  try {
    let data = JSON.parse(readFileSync(hp, 'utf8'));
    data = migrateHistoryData(data);
    res.json(data);
  } catch {
    res.json({ chats: [], generations: [] });
  }
});

app.post('/api/history/chat', authenticate, (req, res) => {
  const hp = getHistoryPath(req.team.name);
  let data = { chats: [], generations: [] };
  if (existsSync(hp)) {
    try { data = migrateHistoryData(JSON.parse(readFileSync(hp, 'utf8'))); } catch {}
  }
  
  const { chatId, message, title } = req.body;
  if (chatId && message) {
    let chat = data.chats.find(c => c.id === chatId);
    if (!chat) {
      chat = { id: chatId, title: title || 'Neuer Chat', messages: [], updatedAt: new Date().toISOString() };
      data.chats.push(chat);
    }
    chat.messages.push(message);
    chat.updatedAt = new Date().toISOString();
  }

  import('fs').then(fs => fs.writeFileSync(hp, JSON.stringify(data, null, 2)));
  res.json({ success: true });
});

app.delete('/api/history/chat/:chatId', authenticate, (req, res) => {
  const hp = getHistoryPath(req.team.name);
  if (!existsSync(hp)) return res.json({ success: false });
  let data = JSON.parse(readFileSync(hp, 'utf8'));
  data = migrateHistoryData(data);
  data.chats = data.chats.filter(c => c.id !== req.params.chatId);
  import('fs').then(fs => fs.writeFileSync(hp, JSON.stringify(data, null, 2)));
  res.json({ success: true });
});

app.put('/api/history/chat/:chatId', authenticate, (req, res) => {
  const hp = getHistoryPath(req.team.name);
  if (!existsSync(hp)) return res.json({ success: false });
  let data = JSON.parse(readFileSync(hp, 'utf8'));
  data = migrateHistoryData(data);
  const chat = data.chats.find(c => c.id === req.params.chatId);
  if (chat) {
    chat.title = req.body.title;
    import('fs').then(fs => fs.writeFileSync(hp, JSON.stringify(data, null, 2)));
  }
  res.json({ success: true });
});

app.post('/api/history/generation', authenticate, (req, res) => {
  const hp = getHistoryPath(req.team.name);
  let data = { chats: [], generations: [] };
  if (existsSync(hp)) {
    try { data = migrateHistoryData(JSON.parse(readFileSync(hp, 'utf8'))); } catch {}
  }
  
  const { generation } = req.body;
  if (generation) {
    data.generations.push(generation);
  }

  import('fs').then(fs => fs.writeFileSync(hp, JSON.stringify(data, null, 2)));
  res.json({ success: true });
});

// ── LiteLLM usage proxy ─────────────────────────────────────────────
app.get('/api/usage', authenticate, async (req, res) => {
  try {
    const r = await fetch(`${getConfig().litellm_base_url}/key/info`, {
      headers: { 'Authorization': `Bearer ${req.team.litellm_api_key}` },
    });
    if (!r.ok) {
      return res.status(r.status).json({ error: `LiteLLM: ${r.statusText}` });
    }
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'LiteLLM nicht erreichbar', details: err.message });
  }
});

// ── AI Chat proxy (streaming) ────────────────────────────────────────
app.post('/api/ai/chat', authenticate, async (req, res) => {
  try {
    const response = await fetch(`${getConfig().litellm_base_url}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.team.litellm_api_key}`,
      },
      body: JSON.stringify({ ...req.body, stream: true }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ error: errBody });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      res.status(502).json({ error: 'AI-Dienst nicht erreichbar', details: err.message });
    } else {
      res.end();
    }
  }
});

// ── AI Image proxy ───────────────────────────────────────────────────
app.post('/api/ai/image', authenticate, async (req, res) => {
  try {
    const hasReference = req.body.reference_images !== undefined;

    if (hasReference) {
      if (!Array.isArray(req.body.reference_images)) {
        return res.status(400).json({ error: 'Referenzbilder müssen ein Array sein' });
      }
      if (req.body.reference_images.length > 3) {
        return res.status(400).json({ error: 'Maximal 3 Referenzbilder erlaubt' });
      }
      for (const img of req.body.reference_images) {
        if (typeof img !== 'string' || !img.startsWith('data:image/')) {
          return res.status(400).json({ error: 'Referenzbild ungültig' });
        }
        if (img.length > 10 * 1024 * 1024) {
          return res.status(400).json({ error: 'Referenzbild zu groß' });
        }
      }
    }

    const prompt = req.body.prompt || '';
    const model = req.body.model || 'dall-e-3';

    let endpoint, upstreamBody;

    if (hasReference) {
      endpoint = '/v1/chat/completions';
      upstreamBody = {
        model,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...req.body.reference_images.map(url => ({ type: 'image_url', image_url: { url } })),
          ],
        }],
        modalities: ['text', 'image'],
        drop_params: true,
      };
    } else {
      endpoint = '/v1/images/generations';
      upstreamBody = { ...req.body };
      delete upstreamBody.response_format;
      delete upstreamBody.reference_images;
    }

    const response = await fetch(`${getConfig().litellm_base_url}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.team.litellm_api_key}`,
      },
      body: JSON.stringify(upstreamBody),
    });
    const data = await response.json();

    if (data.error) {
      return res.status(response.status).json(data);
    }

    let buffer;
    if (hasReference) {
      buffer = extractImageFromChatCompletion(data);
      if (!buffer) throw new Error('Bild konnte nicht aus der Chat-Completion-Antwort extrahiert werden.');
    } else {
      if (data.data && data.data[0]) {
        if (data.data[0].b64_json) {
          buffer = Buffer.from(data.data[0].b64_json, 'base64');
        } else if (data.data[0].url) {
          const imgResponse = await fetch(data.data[0].url);
          if (!imgResponse.ok) throw new Error("Konnte das Bild von der generierten URL nicht herunterladen.");
          const arrayBuffer = await imgResponse.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
        } else {
          throw new Error("Weder Base64-Daten noch URL in der Antwort gefunden.");
        }
      } else {
        throw new Error("Keine Bild-Daten in der Antwort gefunden.");
      }
    }

    if (!buffer) throw new Error('Leere Bild-Daten erhalten.');

    const ext = '.png';
    const filename = `${teamPrefix(req.team.name)}-${uuidv4().slice(0, 8)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    const fs = await import('fs');
    fs.writeFileSync(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const hp = getHistoryPath(req.team.name);
    let hist = { chats: [], generations: [] };
    if (fs.existsSync(hp)) {
      try { hist = migrateHistoryData(JSON.parse(fs.readFileSync(hp, 'utf8'))); } catch {}
    }
    hist.generations.push({
      type: 'image',
      prompt: req.body.prompt,
      url: fileUrl,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(hp, JSON.stringify(hist, null, 2));

    return res.json({ url: fileUrl });
  } catch (err) {
    res.status(502).json({ error: 'Bildgenerierung fehlgeschlagen', details: err.message });
  }
});

function extractImageFromChatCompletion(data) {
  const images = data.choices?.[0]?.message?.images;
  if (Array.isArray(images) && images.length > 0) {
    const url = images[0]?.image_url?.url;
    if (typeof url === 'string' && url.startsWith('data:')) {
      const b64 = url.split(',')[1];
      if (b64) return Buffer.from(b64, 'base64');
    }
  }

  const content = data.choices?.[0]?.message?.content;
  if (Array.isArray(content)) {
    for (const block of content) {
      const url = block?.image_url?.url;
      if (typeof url === 'string' && url.startsWith('data:')) {
        const b64 = url.split(',')[1];
        if (b64) return Buffer.from(b64, 'base64');
      }
    }
  }

  if (typeof content === 'string') {
    const match = content.match(/data:image\/[a-zA-Z0-9+.-]+;base64,([A-Za-z0-9+/=]+)/);
    if (match) return Buffer.from(match[1], 'base64');
  }

  return null;
}

// ── AI Audio (TTS) proxy ─────────────────────────────────────────────
app.post('/api/ai/audio', authenticate, async (req, res) => {
  try {
    let endpoint = '/v1/audio/speech';
    let body = { ...req.body };

    // Fix missing provider prefix for gemini models
    if (body.model && body.model.includes('gemini') && !body.model.includes('/')) {
      body.model = `gemini/${body.model}`;
    }
    
    // Drop params to avoid litellm unsupported param crashes
    body.drop_params = true;

    const response = await fetch(`${getConfig().litellm_base_url}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.team.litellm_api_key}`,
      },
      body: JSON.stringify(body),
    });

    // Fallback via Chat Completions if LiteLLM doesn't support audio/speech for this provider
    if (!response.ok) {
      console.warn(`/v1/audio/speech failed. Trying /v1/chat/completions fallback via extra_body.`);
      const chatBody = {
        model: body.model,
        messages: [{ role: "user", content: body.input }],
        drop_params: true,
        extra_body: {
          modalities: ["audio"],
          audio: { voice: body.voice || "Puck", format: "mp3" }
        }
      };

      const fallbackRes = await fetch(`${getConfig().litellm_base_url}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${req.team.litellm_api_key}`,
        },
        body: JSON.stringify(chatBody),
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        return res.status(fallbackRes.status).json({ error: errText });
      }

      const data = await fallbackRes.json();
      const b64 = data.choices?.[0]?.message?.audio?.data;
      if (b64) {
        const ext = '.mp3';
        const filename = `${teamPrefix(req.team.name)}-${uuidv4().slice(0, 8)}${ext}`;
        const filepath = path.join(UPLOAD_DIR, filename);
        import('fs').then(fs => fs.writeFileSync(filepath, Buffer.from(b64, 'base64')));
        
        const fileUrl = `/uploads/${filename}`;
        return res.json({ url: fileUrl });
      } else {
        return res.status(500).json({ error: "Keine Audiodaten im Chat-Completion-Format gefunden." });
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Save to uploads
    const ext = '.mp3';
    const filename = `${teamPrefix(req.team.name)}-${uuidv4().slice(0, 8)}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);
    
    import('fs').then(fs => fs.writeFileSync(filepath, buffer));
    
    const fileUrl = `/uploads/${filename}`;

    // Auto-append to history
    const hp = getHistoryPath(req.team.name);
    let hist = { chats: [], generations: [] };
    if (existsSync(hp)) {
      try { hist = migrateHistoryData(JSON.parse(readFileSync(hp, 'utf8'))); } catch {}
    }
    hist.generations.push({
      type: 'audio',
      prompt: req.body.input,
      voice: req.body.voice,
      url: fileUrl,
      timestamp: new Date().toISOString()
    });
    import('fs').then(fs => fs.writeFileSync(hp, JSON.stringify(hist, null, 2)));

    // Return the URL
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(502).json({ error: 'Audiogenerierung fehlgeschlagen', details: err.message });
  }
});

// ── Global Chat ──────────────────────────────────────────────────────
const GLOBAL_CHAT_FILE = path.join(DATA_DIR, 'global_chat.json');

function getGlobalChat() {
  if (existsSync(GLOBAL_CHAT_FILE)) {
    try { return JSON.parse(readFileSync(GLOBAL_CHAT_FILE, 'utf8')); } catch {}
  }
  return [];
}

function saveGlobalChat(messages) {
  import('fs').then(fs => fs.writeFileSync(GLOBAL_CHAT_FILE, JSON.stringify(messages, null, 2)));
}

app.get('/api/global-chat', authenticate, (req, res) => {
  res.json({ messages: getGlobalChat() });
});

app.post('/api/global-chat', authenticate, (req, res) => {
  const { text, attachments, replyTo, poll, todo, dice } = req.body;
  if (!text && !(attachments && attachments.length) && !poll && !todo && !dice) return res.status(400).json({ error: 'Content required' });
  
  const msg = {
    id: uuidv4(),
    team: req.team.name,
    text: text || '',
    attachments: attachments || [],
    replyTo: replyTo || null,
    poll: poll || null,
    todo: todo || null,
    dice: dice || null,
    reactions: {},
    timestamp: new Date().toISOString()
  };
  
  const messages = getGlobalChat();
  messages.push(msg);
  if (messages.length > 1000) messages.shift();
  
  saveGlobalChat(messages);
  
  res.json({ success: true, message: msg });
});

app.put('/api/global-chat/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const messages = getGlobalChat();
  const msg = messages.find(m => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Message not found' });

  const { reaction, pollVote, todoToggle } = req.body;
  
  if (reaction) {
    if (!msg.reactions) msg.reactions = {};
    if (!msg.reactions[reaction]) msg.reactions[reaction] = [];
    
    const teamIndex = msg.reactions[reaction].indexOf(req.team.name);
    if (teamIndex > -1) {
      msg.reactions[reaction].splice(teamIndex, 1);
    } else {
      msg.reactions[reaction].push(req.team.name);
    }
  }
  
  if (pollVote !== undefined && msg.poll && msg.poll.options[pollVote]) {
    msg.poll.options.forEach(opt => {
      opt.votes = (opt.votes || []).filter(t => t !== req.team.name);
    });
    msg.poll.options[pollVote].votes.push(req.team.name);
  }
  
  if (todoToggle && msg.todo) {
    msg.todo.checked = !msg.todo.checked;
  }

  saveGlobalChat(messages);
  res.json({ success: true, message: msg });
});

// ── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3333;
app.listen(PORT, 'localhost', () => {
  console.log(`Dashboard: http://localhost:${PORT}`);
});
