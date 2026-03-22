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
  // Allow only localhost (127.0.0.1, ::1, or IPv6-mapped IPv4)
  const isLocalhost = clientIp === '127.0.0.1' || 
                      clientIp === '::1' || 
                      clientIp === '::ffff:127.0.0.1';
  
  if (!isLocalhost) {
    return res.status(403).json({ error: 'Forbidden: IP not allowed' });
  }
  next();
});


app.use((req, res, next) => {
  const clientIp = req.ip;
  const allowedIPs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

  if (!allowedIPs.includes(clientIp)) {
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
  windowMs: 1 * 60 * 1000, 
  max: 10, 
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ 4. BEARER TOKEN AUTHENTICATION MIDDLEWARE ============
const bearerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Bearer token' });
  }

  const token = authHeader.substring(7); 

  if (token !== BEARER_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Bearer token' });
  }

  next();
};

// ============ ROUTES ============

// GET /login - Show login form
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login - Energy Dashboard</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          margin: 0;
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          width: 320px;
        }
        h2 { 
          color: #333; 
          margin: 0 0 30px 0; 
          text-align: center;
          font-size: 24px;
        }
        .error { 
          color: #d32f2f;
          background: #ffebee;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 14px;
        }
        label { 
          display: block;
          color: #555; 
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        input {
          width: 100%;
          padding: 12px;
          margin-bottom: 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
        }
        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          font-weight: 500;
          transition: transform 0.2s;
        }
        button:hover { 
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>⚡ Energy Dashboard</h2>
        ${req.query.error ? '<div class="error">Invalid username or password</div>' : ''}
        <form method="POST" action="/login">
          <label for="username">Username</label>
          <input type="text" id="username" name="username" placeholder="Enter username" required />
          <label for="password">Password</label>
          <input type="password" id="password" name="password" placeholder="Enter password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// POST /login - Handle login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === DASHBOARD_USER && password === DASHBOARD_PASSWORD) {
    // Redirect to dashboard with Basic Auth credentials
    res.redirect(`http://${DASHBOARD_USER}:${DASHBOARD_PASSWORD}@localhost:3000/dashboard`);
  } else {
    res.redirect('/login?error=1');
  }
});

// GET /api/oil-prices - Protected with Bearer Token
app.get('/api/oil-prices', bearerAuth, (req, res) => {
  res.json(oilPriceData);
});
// GET /login - Show login form
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Login</title>
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
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          width: 300px;
        }
        h2 { color: #333; margin-bottom: 20px; text-align: center; }
        input {
          width: 100%;
          padding: 10px;
          margin: 8px 0 16px 0;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
        }
        button {
          width: 100%;
          padding: 10px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover { background: #45a049; }
        .error { color: red; text-align: center; margin-bottom: 10px; }
        label { color: #555; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>⚡ Energy Dashboard</h2>
        ${req.query.error ? '<p class="error">Invalid username or password</p>' : ''}
        <form method="POST" action="/login">
          <label>Username</label>
          <input type="text" name="username" placeholder="Enter username" required />
          <label>Password</label>
          <input type="password" name="password" placeholder="Enter password" required />
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
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

// GET /logout - Clear Basic Auth session
app.get('/logout', (req, res) => {
  // Force browser to drop cached Basic Auth credentials by sending 401 with WWW-Authenticate header
  res.set('WWW-Authenticate', 'Basic realm="Dashboard"');
  res.status(401).send(`
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
        <p>Your session has been cleared. Cached credentials have been removed.</p>
        <a href="/login">Login Again</a>
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
        .info { color: #666; line-height: 1.6; }
        a { color: #4CAF50; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <h1>⚡ Energy API</h1>
      <div class="section">
        <h2>Available Endpoints</h2>
        <div class="info">
          <p><strong>GET /api/oil-prices</strong><br>
          Secured with Bearer Token. Returns global oil price data in JSON format.</p>
          
          <p><strong>GET /dashboard</strong><br>
          Secured with Basic Authentication. Displays oil prices in an interactive table.</p>
          
          <p><strong>GET /logout</strong><br>
          Clears your session and authentication credentials.</p>
        </div>
      </div>
      <div class="section">
        <h2>Quick Links</h2>
        <div class="info">
          <p><a href="/login">→ Login to Dashboard</a></p>
          <p style="margin-top: 15px; font-size: 14px; color: #999;">See <strong>README.md</strong> for complete API documentation, credentials, and testing instructions.</p>
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
