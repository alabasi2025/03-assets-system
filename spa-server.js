const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 4200;
const API_HOST = 'localhost';
const API_PORT = 3000;
const DIST_PATH = path.join(__dirname, 'dist/apps/web/browser');

// Manual proxy for API requests with longer timeout
app.use('/api', (req, res) => {
  const options = {
    hostname: API_HOST,
    port: API_PORT,
    path: '/api' + req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${API_HOST}:${API_PORT}`
    },
    timeout: 30000 // 30 seconds timeout
  };

  console.log(`[Proxy] ${req.method} /api${req.url} -> http://${API_HOST}:${API_PORT}/api${req.url}`);

  const proxyReq = http.request(options, (proxyRes) => {
    // Copy headers
    Object.keys(proxyRes.headers).forEach(key => {
      res.setHeader(key, proxyRes.headers[key]);
    });
    res.statusCode = proxyRes.statusCode;
    proxyRes.pipe(res);
  });

  proxyReq.on('timeout', () => {
    console.error(`[Proxy Timeout] Request timed out`);
    proxyReq.destroy();
    if (!res.headersSent) {
      res.status(504).json({ error: 'Gateway Timeout' });
    }
  });

  proxyReq.on('error', (err) => {
    console.error(`[Proxy Error] ${err.message}`);
    if (!res.headersSent) {
      res.status(502).json({ error: 'Bad Gateway', message: err.message });
    }
  });

  req.pipe(proxyReq);
});

// Serve static files
app.use(express.static(DIST_PATH));

// SPA fallback
app.get('*', (req, res) => {
  console.log(`[SPA] Serving index.html for: ${req.path}`);
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
  console.log(`Serving files from: ${DIST_PATH}`);
  console.log(`API proxy: /api/* -> http://${API_HOST}:${API_PORT}/api/*`);
});

// Set server timeout
server.timeout = 60000; // 60 seconds
