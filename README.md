# ColdMailer.Ai

An AI-powered cold-email generator. Users describe what they want, and the app generates polished cold emails using Google Gemini — with iterative refinement, email history, subscription plans, and payments.

This is a full-stack monorepo containing two applications:

| App | Folder | Description |
| --- | --- | --- |
| **Frontend** | [`Frontend/`](./Frontend) | React 19 + Vite single-page app (landing site, auth, generation workspace, history, payments). |
| **Backend** | [`backend/`](./backend) | Express 5 REST API (auth, AI generation, history, payments, contact form). |

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Backend setup](#2-backend-setup)
  - [3. Frontend setup](#3-frontend-setup)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Plans & Usage Limits](#plans--usage-limits)
- [AI Generation & Model Fallback](#ai-generation--model-fallback)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)

---

## Features

- **Authentication** — email/password sign-up & sign-in plus Google OAuth. JWT access tokens are issued as HTTP-only cookies and in the response body.
- **AI email generation** — prompt-based cold-email generation with a tuned system prompt and iterative, chat-style refinement.
- **Model fallback** — automatically retries across multiple Gemini models for resilience against rate limits/quota errors.
- **Email history** — persist, browse (paginated), refine, and delete previously generated emails per user.
- **Plans & usage limits** — free and paid plans with monthly generation limits and per-email regeneration caps.
- **Payments** — Razorpay checkout, signature verification, payment history, failure handling, and webhook processing.
- **Marketing site** — landing page with pricing, FAQ, testimonials, and a contact form (delivered via email).
- **Security hardening** — Helmet CSP, CORS allow-list, global rate limiting, and centralized error handling.

---

## Architecture

```
┌─────────────────────┐        HTTPS / JWT        ┌─────────────────────┐
│      Frontend       │  ───────────────────────▶ │       Backend       │
│  React + Vite SPA   │  ◀─────────────────────── │   Express REST API  │
└─────────────────────┘        JSON responses      └──────────┬──────────┘
                                                               │
                          ┌────────────────────────────────────┼────────────────────────┐
                          ▼                                     ▼                        ▼
                   ┌────────────┐                     ┌──────────────────┐      ┌────────────────┐
                   │  MongoDB   │                     │  Google Gemini   │      │    Razorpay    │
                   │ (Mongoose) │                     │   (AI models)    │      │   (payments)   │
                   └────────────┘                     └──────────────────┘      └────────────────┘
```

The frontend talks to the backend over a single axios instance (`Frontend/src/utils/api.js`) using the base URL from `VITE_BASE_URL`. Requests carry a `Bearer` token and cookies; a `401` on a protected route clears the token and redirects to sign-in.

---

## Tech Stack

### Frontend

| Area | Technology |
| --- | --- |
| Framework | [React 19](https://react.dev/) |
| Build tool | [Vite 6](https://vite.dev/) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| State | [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/), [tailwind-merge](https://github.com/dcastil/tailwind-merge), `tailwindcss-animate` |
| UI | [Radix UI](https://www.radix-ui.com/), [shadcn-style components](https://ui.shadcn.com/), [lucide-react](https://lucide.dev/) |
| Forms | [react-hook-form](https://react-hook-form.com/) |
| HTTP | [axios](https://axios-http.com/) |
| Auth | [@react-oauth/google](https://github.com/MomenSherif/react-oauth), [jwt-decode](https://github.com/auth0/jwt-decode) |

### Backend

| Area | Technology |
| --- | --- |
| Runtime | [Node.js](https://nodejs.org/) (ES Modules) |
| Framework | [Express 5](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) via [Mongoose 8](https://mongoosejs.com/) |
| AI | [Google Generative AI (Gemini)](https://ai.google.dev/) |
| Auth | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [google-auth-library](https://github.com/googleapis/google-auth-library-nodejs) |
| Payments | [Razorpay](https://razorpay.com/docs/) |
| Validation | [Zod](https://zod.dev/) |
| Email | [Nodemailer](https://nodemailer.com/) |
| Security | [helmet](https://helmetjs.github.io/), [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit), [cors](https://github.com/expressjs/cors), [cookie-parser](https://github.com/expressjs/cookie-parser) |

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended 20+) and npm
- A [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- A [Google AI Studio](https://aistudio.google.com/) API key (Gemini)
- A [Google Cloud OAuth 2.0](https://console.cloud.google.com/apis/credentials) client ID (Google login)
- A [Razorpay](https://dashboard.razorpay.com/) account (payments)
- SMTP credentials, e.g. a Gmail app password (contact form)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ColdMailer-React
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables)), then start the server:

```bash
# Development (auto-reload via nodemon)
npm run dev

# Production
npm start
```

The API runs on `http://localhost:<PORT>` (default `5000`) and connects to MongoDB on boot.

### 3. Frontend setup

Open a second terminal:

```bash
cd Frontend
npm install
```

Create a `.env` file in `Frontend/` (see [Environment Variables](#environment-variables)), then start the dev server:

```bash
npm run dev
```

The app runs on [http://localhost:5173](http://localhost:5173) by default.

> Start the backend first so the frontend can reach the API.

---

## Environment Variables

### Backend — `backend/.env`

```bash
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database (database name "coldmailer" is appended automatically)
MONGODB_URI=mongodb://127.0.0.1:27017

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
| `MONGODB_URI` | Yes | MongoDB base URI. The `coldmailer` database is appended automatically. |
| `ACCESS_TOKEN_SECRET` / `ACCESS_TOKEN_EXPIRY` | Yes | Signing secret and lifetime for access tokens. |
| `REFRESH_TOKEN_SECRET` / `REFRESH_TOKEN_EXPIRY` | Yes | Signing secret and lifetime for refresh tokens. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID used to verify ID tokens. |
| `GEMINIAPIKEY` | Yes | Google Gemini API key. |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Yes* | Razorpay API credentials. |
| `RAZORPAY_WEBHOOK_SECRET` | Yes* | Secret used to verify Razorpay webhook signatures. |
| `EMAIL_USER` / `EMAIL_PASS` | Yes* | SMTP credentials for the contact form. |

\* Required only for the corresponding feature (payments / contact form).

### Frontend — `Frontend/.env`

```bash
# Base URL of the backend API (no trailing slash)
VITE_BASE_URL=http://localhost:5000

# Google OAuth Client ID (must match the backend's GOOGLE_CLIENT_ID)
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_BASE_URL` | Yes | Base URL of the backend REST API. |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID used by `GoogleOAuthProvider`. |

> Vite only exposes variables prefixed with `VITE_` to the client. Restart the dev server after editing `.env`.

---

## Available Scripts

### Frontend (`Frontend/`)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Produce an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally. |
| `npm run lint` | Run ESLint across the project. |

### Backend (`backend/`)

| Script | Description |
| --- | --- |
| `npm run dev` | Start the server with `nodemon` (auto-reload). |
| `npm start` | Start the server with `node`. |
| `npm run build` | Runs `npm install` (used by hosting platforms). |

---

## API Reference

Base path: `/api/v1`. Protected endpoints require a valid JWT sent as a `Bearer` token in the `Authorization` header or as an `accessToken` cookie.

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

Defined in `backend/src/config/paymentPlans.js`; usage is calculated per calendar month in `backend/src/utils/planLimits.js`.

| Plan | ID | Price | Monthly emails | Regenerations / email |
| --- | --- | --- | --- | --- |
| Starter (Free) | `GETSTARTED` | ₹0 (forever) | 50 | 3 |
| Professional | `STARTFREETRIAL` | ₹9 / month | 500 | Unlimited |

---

## AI Generation & Model Fallback

Configured in `backend/src/config/gemini.js` and orchestrated in `backend/src/services/ai.service.js`:

- Generation uses a `SYSTEM_PROMPT` (`backend/src/constants/email.prompts.js`) with `temperature: 0.3` and up to `8192` output tokens.
- Multiple Gemini models are tried in order; if one fails (rate limit, quota, transient error) the service automatically falls back to the next model.
- AI errors are sanitized into user-friendly messages before being returned to the client.

---

## Project Structure

```
ColdMailer-React/
├── Frontend/                        # React + Vite SPA
│   ├── src/
│   │   ├── App.jsx                  # Route definitions (React Router)
│   │   ├── main.jsx                 # Providers: Redux, Google OAuth, Sidebar, Tooltip
│   │   ├── Landing/                 # Marketing sections (hero, pricing, faq, contact)
│   │   ├── page/                    # Routed pages (generate, history, output, auth)
│   │   ├── components/              # Reusable UI (+ ui/ primitives, payment/ flow)
│   │   ├── context/                 # Redux store & slices, sidebar context
│   │   ├── hooks/                   # usePayment, use-toast, use-mobile, useErrorToast
│   │   ├── utils/                   # api client, storage, clipboard, helpers
│   │   ├── lib/                     # email extraction & post-processing
│   │   ├── data/                    # Static content (pricing, faq, testimonials)
│   │   └── loader/                  # Loading skeletons/spinners
│   ├── vite.config.js              # Vite config + "@" → src alias
│   └── vercel.json                 # SPA rewrite rules
│
├── backend/                         # Express REST API
│   ├── src/
│   │   ├── index.js                # Entry: load env, connect DB, start server
│   │   ├── app.js                  # Express app: middleware, security, routes
│   │   ├── config/                 # gemini, paymentPlans, razorpay-client
│   │   ├── constants/              # AI system prompt
│   │   ├── controller/             # user, google.auth, email, payment, contact
│   │   ├── databse/                # MongoDB connection (db.js)
│   │   ├── middleware/             # auth, payment, Webhook, errorHandler
│   │   ├── model/                  # Mongoose schemas (User, Email, Contact)
│   │   ├── routes/                 # Express routers
│   │   ├── services/               # ai.service (fallback), email.service
│   │   ├── validators/             # Zod-based request validation
│   │   └── utils/                  # ApiError/Response, tokens, cookies, planLimits
│   └── vercel.json                 # Serverless deployment config
│
└── README.md                        # You are here
```

---

## Security

- **Helmet** with a custom Content-Security-Policy (allows Razorpay checkout & Google Fonts).
- **CORS** restricted to `CLIENT_URL` plus localhost dev origins, with credentials enabled.
- **Rate limiting** — 100 requests per 10 minutes per IP.
- **Request size limits** — JSON/urlencoded bodies capped at 20kb.
- **Passwords** hashed with bcrypt; JWTs signed with rotating access/refresh secrets.
- **Webhooks** verify Razorpay signatures against `RAZORPAY_WEBHOOK_SECRET`.
- On the client, a `401` on a protected route clears the stored token and redirects to sign-in.

---

## Deployment

Both apps are configured for **Vercel** via their respective `vercel.json` files:

- **Frontend** — SPA rewrite rules route all client-side paths to `index.html`. Set `VITE_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in the project's environment variables.
- **Backend** — builds `src/index.js` with `@vercel/node` and routes all traffic to it. Configure every backend environment variable listed above.

Deploy the two folders as separate Vercel projects, then point the frontend's `VITE_BASE_URL` at the deployed backend URL and set the backend's `CLIENT_URL` to the deployed frontend URL.
