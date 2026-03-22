const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const basicAuth = require('basic-auth');

const app = express();
const PORT = 3000;

// Bearer token for API authentication
const BEARER_TOKEN = 'secure-oil-api-key-2026';

// Basic Auth credentials for dashboard
const DASHBOARD_USER = 'admin';
const DASHBOARD_PASSWORD = 'password123';

// Static oil price data
const oilPriceData = {
  market: 'Global Energy Exchange',
  last_updated: '2026-03-15T12:55:00Z',
  currency: 'USD',
  data: [
    {
      symbol: 'WTI',
      name: 'West Texas Intermediate',
      price: 78.45,
      change: 0.12
    },
    {
      symbol: 'BRENT',
      name: 'Brent Crude',
      price: 82.30,
      change: -0.05
    },
    {
      symbol: 'NAT_GAS',
      name: 'Natural Gas',
      price: 2.15,
      change: 0.02
    }
  ]
};

// ============ MIDDLEWARE STACK ============

// 1. IP FILTERING MIDDLEWARE
app.use((req, res, next) => {
  const clientIp = req.ip;
  // Allow only localhost (127.0.0.1 or ::1)
  if (clientIp !== '127.0.0.1' && clientIp !== '::1') {
    return res.status(403).json({ error: 'Forbidden: IP not allowed' });
  }
  next();
});

// 2. CORS MIDDLEWARE
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 3. RATE LIMITING MIDDLEWARE
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Parse JSON bodies
app.use(express.json());

// ============ ROUTES ============

// GET /api/oil-prices - Protected with Bearer Token
app.get('/api/oil-prices', (req, res) => {
  // 4. BEARER TOKEN AUTHENTICATION
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (token !== BEARER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Bearer token' });
  }

  res.json(oilPriceData);
});

// GET /dashboard - Protected with Basic Auth
app.get('/dashboard', (req, res) => {
  const credentials = basicAuth(req);

  if (!credentials || credentials.name !== DASHBOARD_USER || credentials.pass !== DASHBOARD_PASSWORD) {
    res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
    return res.status(401).send('Unauthorized: Invalid username or password');
  }

  // Serve HTML dashboard
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Oil Prices Dashboard</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        h1 { color: #333; }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th { background: #4CAF50; color: white; }
        .positive { color: green; }
        .negative { color: red; }
        .info { color: #666; margin: 10px 0; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        a:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <h1>Oil Prices Dashboard</h1>
      <p class="info"><strong>Market:</strong> ${oilPriceData.market}</p>
      <p class="info"><strong>Last Updated:</strong> ${oilPriceData.last_updated}</p>
      <p class="info"><strong>Currency:</strong> ${oilPriceData.currency}</p>
      
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Price (USD)</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          ${oilPriceData.data.map(item => `
            <tr>
              <td><strong>${item.symbol}</strong></td>
              <td>${item.name}</td>
              <td>$${item.price.toFixed(2)}</td>
              <td class="${item.change >= 0 ? 'positive' : 'negative'}">
                ${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <a href="/logout">Logout</a>
    </body>
    </html>
  `);
});

// GET /logout - Clear session and redirect
app.get('/logout', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logged Out</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f5f5f5;
          margin: 0;
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        h1 { color: #4CAF50; margin: 0 0 10px 0; }
        p { color: #666; margin: 0; }
        a {
          display: inline-block;
          margin-top: 20px;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        }
        a:hover { background: #45a049; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✓ Logged Out Successfully</h1>
        <p>You have been logged out from the dashboard.</p>
        <a href="/">Return Home</a>
      </div>
    </body>
    </html>
  `);
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Energy API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #f5f5f5;
        }
        h1 { color: #333; }
        .section {
          background: white;
          padding: 20px;
          margin: 20px 0;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        code {
          background: #f0f0f0;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
        }
        .info { color: #666; line-height: 1.6; }
        a { color: #4CAF50; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>⚡ Energy API</h1>
      <div class="section">
        <h2>API Endpoints</h2>
        <div class="info">
          <p><strong>GET /api/oil-prices</strong><br>
          Protected with Bearer Token. Returns oil price data.<br>
          Header: <code>Authorization: Bearer secure-oil-api-key-2026</code></p>
          
          <p><strong>GET /dashboard</strong><br>
          Protected with Basic Auth (admin / password123).<br>
          Displays oil prices in a table format.</p>
          
          <p><strong>GET /logout</strong><br>
          Logout from the dashboard session.</p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`\n📋 API Configuration:`);
  console.log(`   Bearer Token: ${BEARER_TOKEN}`);
  console.log(`   Dashboard User: ${DASHBOARD_USER}`);
  console.log(`   Dashboard Password: ${DASHBOARD_PASSWORD}`);
  console.log(`\n📝 Endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/oil-prices (requires Bearer token)`);
  console.log(`   GET http://localhost:${PORT}/dashboard (requires Basic auth)`);
  console.log(`   GET http://localhost:${PORT}/logout`);
});
