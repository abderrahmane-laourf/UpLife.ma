# UpLife Authentication API

Base URL: `http://localhost:3000`

All authentication routes are mounted under `/api/auth`.

## Requirements

Start the infrastructure services:

```powershell
docker compose up -d db redis
docker compose ps
```

Expected services:

- PostgreSQL: `localhost:15432`
- Redis: `127.0.0.1:6379`

Start the backend:

```powershell
cd backend
npm run dev
```

The API should be available at `http://localhost:3000`.

## Apidog collection

Import this file into Apidog:

`docs/UpLife-Auth.postman_collection.json`

The file uses the Postman Collection v2.1 format, which Apidog can import.

Before testing, set these collection variables:

| Variable | Example | Purpose |
| --- | --- | --- |
| `baseUrl` | `http://localhost:3000` | Backend URL |
| `phone` | `+212600000000` | WhatsApp destination |
| `password` | `Password123!` | Test account password |
| `accessToken` | Automatically saved | Short-lived JWT |
| `resetCode` | `123456` | Code received on WhatsApp |

Enable Apidog cookie storage/cookie jar. The backend sets the refresh token as an HttpOnly `refreshToken` cookie, so JavaScript cannot read it directly.

## Authentication flow

### 1. Register: request verification code

`POST /api/auth/register/request-otp`

```json
{
  "name": "Test User",
  "phone": "+212600000000"
}
```

This first request does not create the user yet. It stores the pending registration in Redis for 10 minutes and queues a six-digit OTP for WhatsApp delivery.

### 2. Register: verify OTP and create account

`POST /api/auth/register/verify-otp`

```json
{
  "code": "123456"
}
```

The code must contain exactly six digits. This endpoint only verifies the code; it does not create the account yet.

### 3. Complete registration

`POST /api/auth/register/complete`

```json
{
  "code": "123456",
  "password": "Password123!"
}
```

The backend validates the OTP again, hashes the password, creates the user, and returns a success message. The frontend redirects the user to Login, where they can sign in normally.

### 4. Login

`POST /api/auth/login`

```json
{
  "password": "Password123!"
}
```

Response example:

```json
{
  "user": {
    "id": "user-id",
    "phone": "+212600000000",
    "name": "Test User"
  },
  "accessToken": "jwt-access-token"
}
```

Use the access token for protected routes:

```text
Authorization: Bearer <accessToken>
```

The access token expires after 15 minutes.

### 4. Refresh access token

`POST /api/auth/refresh-token`

No Authorization header is required. The request must include the `refreshToken` cookie.

The backend verifies the JWT, checks the matching Redis value, rotates the refresh token, and returns a new access token.

```json
{
  "accessToken": "new-jwt-access-token"
}
```

The refresh token is stored in Redis with a seven-day expiration.

### 5. Logout

`POST /api/auth/logout`

Required header:

```text
Authorization: Bearer <accessToken>
```

The backend deletes the user's refresh token from Redis and clears the HttpOnly cookie.

### 6. Request password reset

`POST /api/auth/forgot-password`

```json
{
  "phone": "+212600000000"
}
```

The backend:

1. Generates a six-digit OTP.
2. Stores it in PostgreSQL for 10 minutes.
3. Queues the OTP in BullMQ and sends it through Evolution API to WhatsApp.

The API response does not expose the OTP:

```json
{
  "message": "OTP sent successfully on WhatsApp.",
  "expiresAt": "2026-09-21T12:00:00.000Z"
}
```

Open the WhatsApp conversation for the configured phone and copy the code into the reset request.

## WhatsApp and Evolution API

OTP delivery uses Evolution API instead of SMTP. The backend adds WhatsApp jobs to BullMQ, and the worker sends them through the Evolution API instance.

Start Evolution API:

```powershell
cd evolution-api
docker compose up -d
```

Evolution API is exposed at `http://localhost:8080`. Create the configured instance:

```powershell
curl.exe -X POST http://localhost:8080/instance/create `
  -H "apikey: uplife-evolution-local-key-change-me" `
  -H "Content-Type: application/json" `
  -d '{"instanceName":"uplife","integration":"WHATSAPP-BAILEYS","qrcode":true}'
```

Request the QR code for the instance:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/connect/uplife" `
  -Headers @{ apikey = "uplife-evolution-local-key-change-me"; Origin = "http://localhost:3000" }
```

Open the returned QR code and scan it from WhatsApp. The backend then sends OTP jobs to this instance.

Registration requires a WhatsApp phone number. Use international format such as `+212600000000` or Moroccan local format such as `0600000000`.

### 7. Reset password

`POST /api/auth/reset-password`

```json
{
  "phone": "+212600000000",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

The OTP must be valid and not older than 10 minutes. After a successful reset, all OTP records for that phone are deleted.

## Redis behavior

Redis stores the current refresh token using this key format:

```text
refresh:<userId>
```

To check Redis manually:

```powershell
docker compose ps redis
docker exec uplife-redis redis-cli ping
```

Expected result:

```text
PONG
```

To inspect keys:

```powershell
docker exec uplife-redis redis-cli keys "refresh:*"
```

Do not expose Redis publicly in production. Use a strong Redis password and a private network.

## Common errors

### `EADDRINUSE: port 3000`

Another Node process is using port 3000. Find and stop it:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
Stop-Process -Id <PROCESS_ID> -Force
```

### Redis connection errors

Confirm Docker is running and Redis is healthy:

```powershell
docker compose up -d redis
docker exec uplife-redis redis-cli ping
```

The local `.env` uses:

```env
REDIS_URL="redis://127.0.0.1:6379"
```

### WhatsApp does not receive the message

Check that the Evolution API instance is connected:

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/instance/fetchInstances" `
  -Headers @{ apikey = "uplife-evolution-local-key-change-me"; Origin = "http://localhost:3000" }
```

The instance must show `connectionStatus: open`. If it shows `connecting`, request the QR code from `/instance/connect/uplife` and scan it in WhatsApp. Also check the backend logs for failed BullMQ jobs.
