# Oil Prices API - Express.js with Middleware

A secure API built with Express that demonstrates middleware-based authentication, rate limiting, IP filtering, and CORS protection.

## What This Does

- IP filtering - only localhost requests allowed
- CORS policy - restricted to localhost:3000
- Rate limiting - 10 requests per minute
- Bearer token auth for the API
- Basic auth for the dashboard
- Login page with form-based authentication

## Setup

Clone and install:
```bash
git clone https://github.com/yourusername/express-middleware-assignment.git
cd express-middleware-assignment
npm install
```

## Run It

```bash
npm start
```

Server starts at `http://localhost:3000`

## Endpoints

### GET `/api/oil-prices`
Returns oil price data. Requires bearer token.

Header:
```
Authorization: Bearer secure-oil-api-key-2026
```

Test:
```bash
curl -H "Authorization: Bearer secure-oil-api-key-2026" http://localhost:3000/api/oil-prices
```

### GET `/login`
Login page with form. Enter `admin` / `password123`.

### GET `/dashboard`
Oil price data displayed in a table. Requires basic auth.

Test:
```bash
curl -u admin:password123 http://localhost:3000/dashboard
```

### GET `/logout`
Clears your session.

## Security

**Middleware stack (in order):**
1. IP filtering - localhost only
2. CORS - origin check
3. Rate limiting - 10 req/min
4. Authentication - Bearer token or Basic auth

**Credentials:**
- Bearer Token: `secure-oil-api-key-2026`
- Username: `admin`
- Password: `password123`

## Testing

Token tests:
```bash
# No token (fails)
curl http://localhost:3000/api/oil-prices

# With token (works)
curl -H "Authorization: Bearer secure-oil-api-key-2026" http://localhost:3000/api/oil-prices
```

Basic auth tests:
```bash
# Wrong creds (fails)
curl http://localhost:3000/dashboard

# Right creds (works)
curl -u admin:password123 http://localhost:3000/dashboard
```

Rate limit - make 11+ requests in 1 minute to see it trigger.

## Files

- `app.js` - main server
- `package.json` - dependencies

## Dependencies

- express
- cors
- express-rate-limit
- basic-auth

## Notes

This is for learning purposes. For production:
- Use environment variables for tokens/passwords
- Add HTTPS
- Better auth methods
- Input validation
- Proper logging
