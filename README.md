# Express Middleware Assignment - Oil Prices API

A secure Express.js API with multi-layered middleware for handling oil price data.

## Features

- **IP Filtering**: Only allows requests from localhost (127.0.0.1 or ::1)
- **CORS**: Restricts access to local development origin
- **Rate Limiting**: Enforces 10 requests per minute
- **Bearer Token Authentication**: Protects the `/api/oil-prices` endpoint
- **Basic Authentication**: Protects the `/dashboard` endpoint with username/password
- **Clean UI**: Simple HTML dashboards for visualization

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/express-middleware-assignment.git
   cd express-middleware-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the development server:
```bash
npm start
```

The server will run on `http://localhost:3000`

You should see:
```
✓ Server running on http://localhost:3000

📋 API Configuration:
   Bearer Token: secure-oil-api-key-2026
   Dashboard User: admin
   Dashboard Password: password123

📝 Endpoints:
   GET http://localhost:3000/api/oil-prices (requires Bearer token)
   GET http://localhost:3000/dashboard (requires Basic auth)
   GET http://localhost:3000/logout
```

## API Endpoints

### 1. GET `/api/oil-prices`
**Protection**: Bearer Token Authentication

Returns current oil price data in JSON format.

**Required Header**:
```
Authorization: Bearer secure-oil-api-key-2026
```

**Example Request** (using curl):
```bash
curl -H "Authorization: Bearer secure-oil-api-key-2026" http://localhost:3000/api/oil-prices
```

**Example Response**:
```json
{
  "market": "Global Energy Exchange",
  "last_updated": "2026-03-15T12:55:00Z",
  "currency": "USD",
  "data": [
    {
      "symbol": "WTI",
      "name": "West Texas Intermediate",
      "price": 78.45,
      "change": 0.12
    },
    {
      "symbol": "BRENT",
      "name": "Brent Crude",
      "price": 82.30,
      "change": -0.05
    },
    {
      "symbol": "NAT_GAS",
      "name": "Natural Gas",
      "price": 2.15,
      "change": 0.02
    }
  ]
}
```

### 2. GET `/dashboard`
**Protection**: Basic Authentication

Displays an HTML dashboard showing oil prices in a table format.

**Credentials**:
- Username: `admin`
- Password: `password123`

**Example Request** (using curl):
```bash
curl -u admin:password123 http://localhost:3000/dashboard
```

### 3. GET `/logout`
Clears the session and displays a logout confirmation page.

## Security Features

### Middleware Order
1. **IP Filtering** - Blocks non-localhost traffic (403 Forbidden)
2. **CORS** - Restricts origin to `http://localhost:3000`
3. **Rate Limiting** - Enforces 10 requests per 60 seconds
4. **Authentication** - Bearer Token on API endpoint, Basic Auth on dashboard

### Bearer Token
```
secure-oil-api-key-2026
```

### Dashboard Credentials
```
Username: admin
Password: password123
```

## Testing the API

### Test Bearer Token Protection
```bash
# Without token (will fail)
curl http://localhost:3000/api/oil-prices

# With token (will succeed)
curl -H "Authorization: Bearer secure-oil-api-key-2026" http://localhost:3000/api/oil-prices

# With wrong token (will fail)
curl -H "Authorization: Bearer wrong-token" http://localhost:3000/api/oil-prices
```

### Test Rate Limiting
Make 11 requests within 1 minute - the 11th will be rate limited:
```bash
for i in {1..15}; do 
  curl -H "Authorization: Bearer secure-oil-api-key-2026" http://localhost:3000/api/oil-prices
  sleep 0.1
done
```

### Test Basic Auth
```bash
# Without credentials (will fail)
curl http://localhost:3000/dashboard

# With correct credentials (will succeed)
curl -u admin:password123 http://localhost:3000/dashboard

# With wrong credentials (will fail)
curl -u admin:wrongpassword http://localhost:3000/dashboard
```

### Test IP Filtering
IP filtering is enforced server-side. Only localhost (127.0.0.1 or ::1) requests are allowed.

## Project Structure

```
express-middleware-assignment/
├── app.js           # Main application with all middleware
├── package.json     # Dependencies and scripts
└── README.md        # This file
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-Origin Resource Sharing middleware
- **express-rate-limit**: Rate limiting middleware
- **basic-auth**: Basic authentication parser

## Security Notes

⚠️ **For production use**:
- Use environment variables for sensitive data (Bearer token, credentials)
- Implement HTTPS/SSL
- Use more sophisticated authentication methods
- Add input validation and sanitization
- Implement proper logging and monitoring
- Use HTTPS-only cookies for session management

## License

MIT
