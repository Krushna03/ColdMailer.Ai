# ColdMailer.Ai — Backend

The REST API for **ColdMailer.Ai**, an AI-powered cold-email generator. It handles authentication (email/password + Google OAuth), AI email generation via Google Gemini, email history storage, subscription/payments through Razorpay, and contact form delivery over email.

> This is the server half of the project. The React client lives in the sibling [`Frontend/`](../Frontend) folder.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime | [Node.js](https://nodejs.org/) (ES Modules) |
| Framework | [Express 5](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| AI | [Google Generative AI (Gemini)](https://ai.google.dev/) |
| Auth | [JSON Web Tokens](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) |
| Payments | [Razorpay](https://razorpay.com/docs/) |
| Validation | [Zod](https://zod.dev/) |
| Email | [Nodemailer](https://nodemailer.com/) |
| Security | [helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [cors](https://github.com/expressjs/cors), [cookie-parser](https://github.com/expressjs/cookie-parser) |

---

## Features

- **Authentication** — register/login with hashed passwords, JWT access tokens (issued as HTTP-only cookies and in the response body), and Google OAuth ID-token verification.
- **AI email generation** — cold-email generation with a system prompt, iterative refinement (chat-style revisions), and **automatic model fallback** across multiple Gemini models for resilience.
- **Email history** — persist generated emails per user with pagination, refinement history, and deletion.
- **Plans & usage limits** — free and paid plans with monthly generation limits and per-email regeneration caps.
- **Payments** — Razorpay order creation, signature verification, payment history, failure handling, and webhook processing.
- **Contact form** — sends contact submissions via Nodemailer.
- **Security hardening** — Helmet CSP, CORS allow-list, global rate limiting, and centralized error handling.

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended 20+)
- npm (bundled with Node.js)
- A [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Google AI Studio](https://aistudio.google.com/) API key for Gemini
- A [Google Cloud OAuth 2.0](https://console.cloud.google.com/apis/credentials) client ID (for Google login)
- A [Razorpay](https://dashboard.razorpay.com/) account (for payments)
- SMTP credentials (e.g., a Gmail app password) for the contact form

---

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `backend/` directory:

```bash
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://127.0.0.1:27017        # database "coldmailer" is appended automatically

# JWT
ACCESS_TOKEN_SECRET=your-access-token-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRY=10d

# Google OAuth
GOOGLE_CLIENT_ID=your-google-oauth-client-id

# Google Gemini
GEMINIAPIKEY=your-gemini-api-key

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-razorpay-webhook-secret

# Contact form (Nodemailer / SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-app-password
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | Yes | Port the server listens on. |
| `NODE_ENV` | Recommended | `production` enables secure cookies and hides internal error details. |
| `CLIENT_URL` | Yes | Frontend origin allowed by CORS (localhost origins are also allowed by default). |
| `MONGODB_URI` | Yes | MongoDB base URI. The `coldmailer` database name is appended automatically. |
| `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` | Yes | Signing secret and lifetime for access tokens. |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` | Yes | Signing secret and lifetime for refresh tokens. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID used to verify ID tokens. |
| `GEMINIAPIKEY` | Yes | Google Gemini API key. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes* | Razorpay API credentials. Required for the payment flow. |
| `RAZORPAY_WEBHOOK_SECRET` | Yes* | Secret used to verify Razorpay webhook signatures. |
| `EMAIL_USER` / `EMAIL_PASS` | Yes* | SMTP credentials for the contact form (Gmail app password recommended). |

\* Required only for the corresponding feature (payments / contact form).

### 3. Run the server

```bash
# Development (auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:<PORT>` and connects to MongoDB on boot.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the server with `nodemon` for auto-reload. |
| `npm start` | Start the server with `node`. |
| `npm run build` | Runs `npm install` (used by hosting platforms). |

---

## API Reference

Base path: `/api/v1`

Protected endpoints require a valid JWT sent either as a `Bearer` token in the `Authorization` header or as an `accessToken` cookie.

### Health

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Service health & uptime. |

### User & Auth — `/api/v1/user`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Register a new user (validated). |
| `POST` | `/login` | Public | Log in with email & password (validated). |
| `GET` | `/getCurrentUser` | Protected | Get the authenticated user. |
| `POST` | `/logout` | Protected | Log out (clears cookie & refresh token). |
| `GET` | `/google/callback` | Public | Verify a Google OAuth ID token and log in/register. |
| `GET` | `/get-user-count` | Public | Total registered user count. |

### Email — `/api/v1/email`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/generate-email` | Protected | Generate a new cold email from a prompt. |
| `POST` | `/update-email` | Protected | Regenerate/update an email with modifications. |
| `GET` | `/get-user-email-history` | Protected | Paginated email history (`?limit=&page=`). |
| `PATCH` | `/update-email-history` | Protected | Append an iterative refinement to an email. |
| `DELETE` | `/delete-email` | Protected | Delete an email. |
| `GET` | `/usage` | Protected | Current plan usage summary. |

### Payment — `/api/v1/payment`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/plans` | Public | List available subscription plans. |
| `POST` | `/create-order` | Protected | Create a Razorpay order. |
| `POST` | `/verify-payment` | Protected | Verify payment signature & activate plan (validated). |
| `GET` | `/history` | Protected | Payment history for the user. |
| `POST` | `/failure` | Protected | Record a failed payment attempt. |
| `POST` | `/webhook` | Razorpay | Razorpay webhook (raw body, signature-verified). |

### Contact — `/api/v1/contact`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/new-contact` | Public | Send a contact-form message via email. |

---

## Plans & Usage Limits

Plans are defined in `src/config/paymentPlans.js`:

| Plan | ID | Price | Monthly emails | Regenerations / email |
| --- | --- | --- | --- | --- |
| Starter (Free) | `GETSTARTED` | ₹0 (forever) | 50 | 3 |
| Professional | `STARTFREETRIAL` | ₹9 / month | 500 | Unlimited |

Usage is calculated per calendar month in `src/utils/planLimits.js` and enforced during generation.

---

## AI Generation & Model Fallback

Configured in `src/config/gemini.js` and orchestrated in `src/services/ai.service.js`:

- Generation uses a `SYSTEM_PROMPT` (`src/constants/email.prompts.js`) with `temperature: 0.3` and up to `8192` output tokens.
- Multiple Gemini models are tried in order; if one fails (rate limit, quota, transient error) the service automatically falls back to the next model.
- AI errors are sanitized into user-friendly messages before being returned to the client.

---

## Project Structure

```
backend/
├── src/
│   ├── index.js                 # Entry point: loads env, connects DB, starts server
│   ├── app.js                   # Express app: middleware, security, route mounting
│   ├── loadEnv.js               # Loads environment variables from .env
│   │
│   ├── config/
│   │   ├── gemini.js            # Gemini model instances (with fallback list)
│   │   ├── paymentPlans.js      # Plan definitions & limits
│   │   └── razorpay-client.js   # Razorpay SDK instance
│   │
│   ├── constants/
│   │   └── email.prompts.js     # System prompt for AI generation
│   │
│   ├── controller/              # Request handlers
│   │   ├── user.controller.js
│   │   ├── google.auth.controller.js
│   │   ├── email.controller.js
│   │   ├── payment.controller.js
│   │   └── contact.controller.js
│   │
│   ├── databse/
│   │   └── db.js                # MongoDB connection
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification (verifyJWT)
│   │   ├── payment.middleware.js
│   │   ├── Webhook.middleware.js
│   │   └── errorHandler.js      # Centralized error handling
│   │
│   ├── model/                   # Mongoose schemas
│   │   ├── User.models.js
│   │   ├── Email.model.js
│   │   └── Contact.model.js
│   │
│   ├── routes/                  # Express routers
│   │   ├── user.route.js
│   │   ├── email.routes.js
│   │   ├── payment.routes.js
│   │   └── contact.routes.js
│   │
│   ├── services/                # Business logic
│   │   ├── ai.service.js        # Gemini generation + fallback
│   │   └── email.service.js
│   │
│   ├── validators/
│   │   └── email.validators.js
│   │
│   └── utils/
│       ├── ApiError.js
│       ├── ApiResponse.js
│       ├── asyncHandler.js
│       ├── cookie.js            # Cookie options (secure in production)
│       ├── token.js             # Access/refresh token generation
│       ├── planLimits.js        # Usage window & limit helpers
│       ├── subscription.js
│       ├── email.js
│       └── Zod-Validations/     # Zod schemas for user auth
│
├── vercel.json                  # Vercel serverless deployment config
└── package.json
```

---

## Security

- **Helmet** with a custom Content-Security-Policy (allows Razorpay checkout & Google Fonts).
- **CORS** restricted to `CLIENT_URL` plus localhost dev origins, with credentials enabled.
- **Rate limiting** — 100 requests per 10 minutes per IP.
- **Request size limits** — JSON/urlencoded bodies capped at 20kb.
- **Passwords** hashed with bcrypt; JWTs signed with rotating access/refresh secrets.
- **Webhook** endpoint verifies Razorpay signatures against `RAZORPAY_WEBHOOK_SECRET`.

---

## Deployment (Vercel)

`vercel.json` builds `src/index.js` with `@vercel/node` and routes all traffic to it. Configure every environment variable listed above in the Vercel project settings before deploying.

---

## Related

- Frontend client & setup: [`Frontend/README.md`](../Frontend/README.md)
