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
| `email` | `user@example.com` | Test account email |
| `password` | `Password123!` | Test account password |
| `accessToken` | Automatically saved | Short-lived JWT |
| `resetCode` | `123456` | Code received in Mailtrap |

Enable Apidog cookie storage/cookie jar. The backend sets the refresh token as an HttpOnly `refreshToken` cookie, so JavaScript cannot read it directly.

## Authentication flow

### 1. Register

`POST /api/auth/register`

```json
{
  "name": "Test User",
  "email": "user@example.com",
  "password": "Password123!"
}
```

The response contains an access token. The backend also creates a refresh token, stores it in Redis, and sends it as an HttpOnly cookie.

### 2. Login

`POST /api/auth/login`

```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

Response example:

```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
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

### 3. Refresh access token

`POST /api/auth/refresh-token`

No Authorization header is required. The request must include the `refreshToken` cookie.

The backend verifies the JWT, checks the matching Redis value, rotates the refresh token, and returns a new access token.

```json
{
  "accessToken": "new-jwt-access-token"
}
```

The refresh token is stored in Redis with a seven-day expiration.

### 4. Logout

`POST /api/auth/logout`

Required header:

```text
Authorization: Bearer <accessToken>
```

The backend deletes the user's refresh token from Redis and clears the HttpOnly cookie.

### 5. Request password reset

`POST /api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

The backend:

1. Generates a six-digit OTP.
2. Stores it in PostgreSQL for 10 minutes.
3. Sends the OTP through Mailtrap SMTP.

The API response does not expose the OTP:

```json
{
  "message": "OTP sent successfully. Check your inbox.",
  "expiresAt": "2026-09-21T12:00:00.000Z"
}
```

Open the Mailtrap inbox and copy the code into the reset request.

### 6. Reset password

`POST /api/auth/reset-password`

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

The OTP must be valid and not older than 10 minutes. After a successful reset, all OTP records for that email are deleted.

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

### Mailtrap does not receive the email

Check the Mailtrap credentials in `backend/.env`:

```env
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=2525
MAILTRAP_USER="your_mailtrap_user"
MAILTRAP_PASS="your_mailtrap_password"
```

Then restart the backend after changing environment variables.
