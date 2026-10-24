const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('./db');

const PORT = Number(process.env.PORT) || 3000;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = req.url.split('?')[0];

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Database REST API Endpoints
  if (parsedUrl.startsWith('/api/')) {
    if (parsedUrl === '/api/dump' || parsedUrl === '/api/database') { return sendJson(res, 200, db.getFullDump()); }
    if (parsedUrl === '/api/stats' || parsedUrl === '/api/status') {
      return sendJson(res, 200, db.getStats());
    }

    if (parsedUrl === '/api/products') {
      if (req.method === 'GET') {
        return sendJson(res, 200, db.getProducts());
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = db.saveProduct(body);
        return sendJson(res, 201, { success: true, product: saved });
      }
    }

    if (parsedUrl.startsWith('/api/products/')) {
      const prodId = parsedUrl.replace('/api/products/', '');
      if (req.method === 'DELETE') {
        const success = db.deleteProduct(prodId);
        return sendJson(res, 200, { success });
      }
    }

    if (parsedUrl === '/api/orders') {
      if (req.method === 'GET') {
        return sendJson(res, 200, db.getOrders());
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const order = db.createOrder(body);
        return sendJson(res, 201, { success: true, order });
      }
    }

    if (parsedUrl.startsWith('/api/messages')) {
      const urlParams = new URL('http://localhost' + req.url);
      const threadId = urlParams.searchParams.get('threadId') || 'default';

      if (req.method === 'GET') {
        return sendJson(res, 200, db.getMessages(threadId));
      }
      if (req.method === 'POST') {
        const body = await parseBody(req);
        const saved = db.saveMessage(threadId, body);
        return sendJson(res, 201, { success: true, message: saved });
      }
    }

    return sendJson(res, 404, { error: 'API endpoint not found' });
  }

  // Static File Serving
  let reqPath = parsedUrl;
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';
  
  const filePath = path.join(__dirname, reqPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('\n======================================================');
  console.log('🪔 Artisans360 (UTU Bardoli 25km) is LIVE!');
  console.log('📦 JSON Database: Active (data/artisans360_database.json)');
  console.log('🌐 Local URL: http://localhost:' + PORT);
  console.log('======================================================\n');
});
