# ColdMailer – Full Interview Q&A

A complete interview preparation guide covering every aspect of the **ColdMailer-React** project (MERN + Vite + Tailwind + shadcn/ui + Redux Toolkit + Google Gemini AI + Razorpay payments + Google OAuth + JWT auth).

---

## Table of Contents
1. [Project Overview / High-Level](#1-project-overview--high-level)
2. [Frontend – React / Vite / Routing](#2-frontend--react--vite--routing)
3. [State Management – Redux Toolkit](#3-state-management--redux-toolkit)
4. [UI / Styling – Tailwind + shadcn/ui + Radix](#4-ui--styling--tailwind--shadcnui--radix)
5. [Forms & Validation – Frontend](#5-forms--validation--frontend)
6. [HTTP / API Calls – Axios](#6-http--api-calls--axios)
7. [Backend – Node.js + Express](#7-backend--nodejs--express)
8. [Database – MongoDB + Mongoose](#8-database--mongodb--mongoose)
9. [Authentication – JWT + Refresh Tokens + Google OAuth](#9-authentication--jwt--refresh-tokens--google-oauth)
10. [Security](#10-security)
11. [Validation – Zod](#11-validation--zod)
12. [Payment Integration – Razorpay](#12-payment-integration--razorpay)
13. [AI Integration – Google Gemini](#13-ai-integration--google-gemini)
14. [Email Sending – Nodemailer](#14-email-sending--nodemailer)
15. [Plan / Subscription System](#15-plan--subscription-system)
16. [Webhooks Deep Dive](#16-webhooks-deep-dive)
17. [Error Handling & Logging](#17-error-handling--logging)
18. [Deployment – Vercel](#18-deployment--vercel)
19. [Performance & Optimization](#19-performance--optimization)
20. [Testing & Quality](#20-testing--quality)
21. [Git / Workflow](#21-git--workflow)
22. [JavaScript / Node Fundamentals](#22-javascript--node-fundamentals)
23. [React Fundamentals](#23-react-fundamentals)
24. [System Design / Behavioral](#24-system-design--behavioral)

---

## 1. Project Overview / High-Level

### Q1. Can you walk me through your ColdMailer project end-to-end?
ColdMailer is an **AI-powered cold-email generator** built with the MERN stack. A user signs up using email/password or Google OAuth, gets a JWT stored in an httpOnly cookie, and lands on the dashboard. They type a short prompt (e.g., "Reach out to a recruiter at Google for an SDE role"), and the backend forwards it to **Google Gemini** (`gemini-2.5-flash-lite`) with a carefully crafted system prompt to produce a complete, professional cold email. The generated email is stored in MongoDB with the user's ID and can be iteratively refined (each refinement is pushed into a `chatEmails` array of the email document). Users can view history, edit, delete, and upgrade their plan via **Razorpay** (with signature verification + webhooks for reliability). Rate limiting, Helmet CSP, plan-based monthly limits, and Zod validators add the production-grade layer.

### Q2. What problem does ColdMailer solve and who is the target user?
Writing cold emails is time-consuming and most people don't know the right tone, structure, or hooks. ColdMailer turns a one-line intent into a polished, personalized email in seconds. Target users are **job seekers, freelancers, founders, sales reps, students reaching out to professors**.

### Q3. What is the tech stack you used and why?
- **Frontend:** React 19 + Vite (fast HMR, smaller bundles), Tailwind CSS + shadcn/ui (rapid, consistent UI), Redux Toolkit (predictable state), React Router v7, react-hook-form (lightweight forms), Axios (request/response interceptors).
- **Backend:** Node.js + Express 5 (ESM), Mongoose, JWT, bcryptjs, Zod, Helmet, express-rate-limit.
- **Third-party:** Google Generative AI (Gemini), Razorpay, Nodemailer, Google OAuth via `google-auth-library`.
- **Deployment:** Vercel (both frontend and serverless backend).

### Q4. What is the high-level architecture?
```
[React (Vercel CDN)]
       │ axios (withCredentials)
       ▼
[Express API (Vercel Serverless)]
   ├── Auth (JWT cookie, Google OAuth)
   ├── Email service ──► Google Gemini
   ├── Payment ──► Razorpay (orders + webhooks)
   ├── Mongoose ──► MongoDB Atlas
   └── Nodemailer ──► SMTP
```

### Q5. Why a monorepo-style structure with separate `Frontend` and `backend` folders?
- Independent dependencies, scripts and deploy configs (`Frontend/vercel.json` vs `backend/vercel.json`).
- Different runtimes (Vite vs Node).
- Easier to dockerize/migrate either side later, while still sharing the same git history and PRs.

### Q6. What were the biggest challenges?
- Handling **Razorpay webhook signature** verification with the raw body while Express still parses JSON for normal routes (order of middleware matters).
- Designing the AI prompt so output is deterministic enough for a cold email but varied enough to feel human (low `temperature: 0.3`).
- Managing **plan-based limits** without hitting the DB on every request — done via `enforceSubscriptionFreshness` and counting monthly usage.
- Making auth work both with httpOnly cookies (web) and `Authorization: Bearer` header (fallback).

### Q7. What features are paid vs free?
Free plan (`GETSTARTED`) has a monthly email-generation cap and a limited number of regenerations per email. Paid plans (configured in `paymentPlans.js`) raise/remove those limits. Plan state lives on `User.planId`, `planName`, `planExpiresAt`.

### Q8. How would you scale to 1M users?
- Move AI calls behind a **queue** (BullMQ/SQS) and stream results via Server-Sent Events.
- Add **Redis** for session, rate limits and usage counters.
- **Read replicas** in MongoDB, proper indexes (already have `userId + createdAt` on Email).
- **CDN** for static assets, **edge caching** for `/payment/plans`.
- Auto-scaling containers (ECS/K8s) instead of single serverless functions for the long-running webhook processing.

### Q9. What would you improve if you rebuilt it?
- TypeScript end-to-end.
- Move from localStorage to httpOnly cookies for the frontend "token" check.
- Add tests (Vitest + Supertest).
- Use **OpenAPI** for contract-first APIs.
- Replace polling for usage with **WebSockets**.
- Add **redux-persist** instead of manual `localStorage`.

### Q10. How long did it take and what did you learn?
Roughly *N* months of part-time work. Biggest learnings: webhook idempotency, securing JWT cookies across domains in production, prompt engineering, Mongoose pre-hooks and indexing, and structuring an Express app cleanly (`controller → service → model`).

---

## 2. Frontend – React / Vite / Routing

### Q11. Why Vite over CRA?
Vite uses **native ESM** during dev (no bundling), so cold start is < 1 sec even on large apps. CRA bundles everything with webpack which is slow. Production builds use **Rollup** with better tree-shaking and smaller bundles. CRA is no longer actively maintained.

### Q12. What version of React and which React 19 features did you use?
React **19**. Used the new automatic batching everywhere, simpler `useActionState` (where applicable), and `ref` as a regular prop (no `forwardRef` needed). The new JSX runtime means no `import React` in every file.

### Q13. Explain routing in `App.jsx`.
Using `createBrowserRouter` + `RouterProvider` (data-router API):
```1:55:Frontend/src/App.jsx
const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/sign-in", element: <LoginPage /> },
  { path: "/sign-up", element: <RegisterPage /> },
  { path: "*", element: <NotFound /> },
  { path: "/generate-email", element: (<Protected><GenerateEmail /></Protected>) },
  { path: "/email/:id", element: (<Protected><EmailHistory /></Protected>) },
  { path: "/payment", element: (<Protected><PaymentComponent /></Protected>) },
])
```
The `*` route catches anything unknown → `NotFound`. The `:id` is a dynamic URL param consumed via `useParams()`.

### Q14. How does `<Protected>` work?
```1:23:Frontend/src/components/Protected.jsx
const Protected = ({ children }) => {
  const location = useLocation()
  const user = localStorage.getItem('token')
  if (!user) return <Navigate to="/sign-in" state={{ from: location }} replace />
  return children;
}
```
If there's no token, the user is redirected to `/sign-in` and the original path is remembered in `location.state.from` so we can send them back after login.
> ⚠️ Honest answer in an interview: this is a UX guard only — real protection happens in the backend `verifyJWT` middleware. The frontend token check stops UI flicker but cannot be trusted.

### Q15. Difference between `BrowserRouter` and `createBrowserRouter`?
`BrowserRouter` is the old component-based API. `createBrowserRouter` is the new **data router** API that enables features like `loaders`, `actions`, `useNavigation`, and error boundaries per route. It's the recommended approach in React Router v6.4+.

### Q16. How is `src/` organized?
- `components/` – reusable UI (Header, Sidebar, Payment, Protected, MarqueeTestimonials, email-input/output/generator, ui/ for shadcn primitives).
- `page/` – route-level pages (Login, Register, Generate-email, EmailHistory, Google-Login).
- `hooks/` – `usePayment`, `use-toast`, `use-mobile`.
- `context/` – `authSlice`, `store`, `SidebarContext(+Provider)`.
- `Landing/` – marketing landing page.
- `lib/` – utility helpers (cn, etc.).
- `loader/`, `data/`, `constants/`, `Helper/`, `utils/`.

### Q17. Purpose of `jsconfig.json` and path aliases?
`jsconfig.json` tells VSCode how to resolve imports (`@/components` → `src/components`). Combined with Vite's `resolve.alias`, you avoid `../../../` hell.

### Q18. Why `.jsx` instead of `.tsx`?
Faster prototyping. The trade-off: weaker compile-time guarantees, harder refactors, and runtime-only errors. In production I'd port to TypeScript.

### Q19. How do you handle a "Page Not Found"?
The wildcard route:
```jsx
{ path: "*", element: <NotFound /> }
```
React Router matches it last and renders the `NotFound` component.

### Q20. What is lazy loading and did you implement it?
Lazy loading splits the bundle so heavy pages load only when visited:
```jsx
const Payment = React.lazy(() => import('./components/Payment'))
<Suspense fallback={<Loader />}><Payment /></Suspense>
```
Currently routes are eager. I'd lazy-load `Payment` and `EmailHistory` (the biggest pages) to cut initial bundle by ~30%.

---

## 3. State Management – Redux Toolkit

### Q21. Why Redux Toolkit over Context API or Zustand?
- **vs Context:** Context re-renders every consumer on state change; Redux uses selectors → only components whose selected slice changed re-render.
- **vs Zustand:** Redux Toolkit gives a standardized pattern, DevTools time-travel, and middleware ecosystem (rtk-query). Zustand is lighter but less opinionated.

### Q22. Explain `authSlice.js`.
```1:30:Frontend/src/context/authSlice.js
const initialState = {
  status: false,
  userData: JSON.parse(localStorage.getItem("data")) || null,
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { role, ...userData } = action.payload;
      state.status = true;
      state.userData = userData;
      localStorage.setItem("data", JSON.stringify(userData))
    },
    logout: (state) => {
      state.status = false;
      state.userData = null;
      localStorage.removeItem('data')
    },
  }
})
```
- `login` saves the user (stripping `role`) into state and `localStorage`.
- `logout` clears both.
- `createSlice` auto-generates action creators and uses Immer internally so we mutate `state` safely.

### Q23. Storing user data in `localStorage` — safe?
For non-sensitive UI data (username, plan) it's acceptable. **Never store JWTs there** — they'd be readable by any injected script (XSS). My JWT lives in an **httpOnly** cookie set by the backend; `localStorage` only holds the profile blob for fast UI hydration.

### Q24. `createSlice` vs `createReducer`?
`createSlice` = `createReducer` + action creators + initial state in one. `createReducer` is lower level and only gives you the reducer function.

### Q25. How do `useSelector` and `useDispatch` work?
- `useSelector(state => state.auth.userData)` subscribes the component to that part of the store using strict equality; component re-renders only when that value changes.
- `useDispatch()` returns the `store.dispatch` function so you can fire actions.

### Q26. Role of `store.js`?
```1:9:Frontend/src/context/store.js
const store = configureStore({
  reducer: { auth: authSlice }
})
```
`configureStore` wires reducers, adds default middleware (thunk, serializableCheck, immutableCheck) and connects Redux DevTools. The store is then passed to `<Provider store={store}>` in `main.jsx`.

### Q27. Redux vs Redux Toolkit?
Redux is the core library (store, reducer, action). RTK is the official, opinionated wrapper that removes boilerplate (`createSlice`, `createAsyncThunk`, `configureStore`, RTK Query).

### Q28. Properly persist Redux state?
Use **redux-persist** with `storage: localStorage` and a `whitelist: ['auth']`. It uses a transform pipeline and rehydrates on app load via `PersistGate`. Currently I do it manually inside the reducer, which couples state to side-effects.

### Q29. Why also use React Context (`SidebarContext`)?
Sidebar open/close is a purely local UI concern — adding it to Redux would pollute global state. Context is perfect for short-lived, component-tree-scoped state.

### Q30. What's a thunk and did you use one?
A thunk is a function returned from an action creator that has access to `dispatch` and `getState`, used for async work:
```js
export const fetchUser = () => async (dispatch) => {
  const res = await axios.get('/user/me')
  dispatch(login(res.data))
}
```
I currently call `axios` inside components/hooks and dispatch sync `login` — moving it into a thunk would centralize the logic.

---

## 4. UI / Styling – Tailwind + shadcn/ui + Radix

### Q31. Why Tailwind CSS?
Utility-first → no naming things, no context-switch to CSS files, dead-code elimination via `content` scanning, design-token consistency. Cons: HTML can look noisy; large class lists need extraction patterns.

### Q32. What is shadcn/ui? How is it different from MUI/Chakra?
shadcn/ui is **not a component library** — it's a CLI that **copies** unstyled, accessible Radix primitives + Tailwind classes directly into your codebase. You own the code. MUI/Chakra ship as npm packages you can only theme; with shadcn you can edit anything.

### Q33. What is `class-variance-authority` (CVA)?
It generates type-safe class strings for variants:
```js
const button = cva("rounded px-4 py-2", {
  variants: { intent: { primary: "bg-blue-600", danger: "bg-red-600" } }
})
button({ intent: "primary" }) // → "rounded px-4 py-2 bg-blue-600"
```
Used inside `components/ui/button.jsx`.

### Q34. What does `clsx` + `tailwind-merge` solve?
`clsx` joins conditional classNames. `tailwind-merge` removes Tailwind conflicts (`p-2 p-4` → `p-4`). Together (via `cn()` helper) you get safe composition.

### Q35. Why Radix UI primitives?
Radix gives **fully accessible, unstyled** building blocks (focus traps, ARIA, keyboard nav) for dialogs, dropdowns, toasts, tooltips. You just style them — accessibility comes free.

### Q36. How is the UI responsive?
**Mobile-first**: base styles target mobile, `sm:`, `md:`, `lg:` add desktop overrides. The Sidebar switches to a Sheet on mobile using `use-mobile` hook.

### Q37. How did you build the Sidebar and Header?
Sidebar uses `SidebarContext` to manage `isOpen` and a Radix-based slide-over for mobile. Header reads auth state from Redux, conditionally renders Login/Logout, and uses Radix `DropdownMenu` for the user menu.

### Q38. How did you implement Marquee Testimonials?
CSS keyframes animation translating X infinitely; cards duplicated to create a seamless loop. Tailwind classes + `animation` config in `tailwind.config.js`.

### Q39. Dark mode?
Not implemented yet. Easiest path: shadcn's `next-themes` pattern + `darkMode: 'class'` in Tailwind config, then add `dark:` variants.

### Q40. What is `tailwindcss-animate`?
A plugin that adds animation utilities (`animate-in fade-in slide-in-from-top`) required by shadcn components.

---

## 5. Forms & Validation – Frontend

### Q41. Why `react-hook-form`?
Uses **uncontrolled inputs** + refs → minimal re-renders → faster than Formik. Built-in schema validation hooks (`yupResolver`, `zodResolver`).

### Q42. Validation in Login/Register?
`register()` registers each input with rules (`required`, `minLength`, regex). `handleSubmit(onSubmit)` validates first, then calls `onSubmit` only if valid; otherwise it populates `formState.errors`.

### Q43. How do you show errors?
`{errors.email && <p className="text-red-500">{errors.email.message}</p>}`.

### Q44. Loading states / toasts?
Local `useState` for loading buttons; Radix `Toaster` + the `use-toast` hook for global notifications (success / error after API calls).

### Q45. What is `use-toast` based on?
Radix Toast primitive (shadcn pattern). Maintains a reducer-style store of active toasts and exposes `toast({ title, description, variant })`.

---

## 6. HTTP / API Calls – Axios

### Q46. Why Axios over `fetch`?
- Automatic JSON parsing.
- Interceptors for refresh-token logic.
- Cancellation, timeout out-of-the-box.
- Better error model (`error.response.status` vs manual `res.ok` check).

### Q47. Axios interceptors?
I'd add a **response interceptor** that, on `401`, calls `/refresh-token` and retries the original request — then everything else doesn't need to know about expiry. Currently the project handles 401 by redirecting to login.

### Q48. How do cookies cross origins (`withCredentials`)?
On the frontend: `axios.create({ baseURL, withCredentials: true })`. On the backend: `cors({ origin, credentials: true })` plus cookies set with `sameSite: 'none'` + `secure: true` in production. Otherwise the browser drops the cookie.

### Q49. Global error handling?
Centralized via Axios response interceptor → push to toast store → optionally log out on 401. Errors are shaped by the backend `errorHandler` as `{ success: false, message }`.

### Q50. Environment variables in Vite?
Prefix with `VITE_`, access via `import.meta.env.VITE_API_URL`. Vite **only inlines `VITE_*`** to avoid leaking server secrets.

---

## 7. Backend – Node.js + Express

### Q51. Walk through `app.js` and `index.js`.
- `index.js`: loads `.env`, creates singletons (`razorpayInstance`, Google `OAuth2Client`, Gemini `model`), calls `connectDB()` then `app.listen()`. Exports `app` so Vercel can wrap it.
- `app.js`: builds the Express app — Helmet → CORS → **raw webhook route** → rate limit → JSON parser → cookie parser → static → routes (`/payment`, `/contact`, `/user`, `/email`) → errorHandler.

### Q52. Why `"type": "module"`?
Enables **native ES Modules** (`import/export`) instead of CommonJS (`require`). Cleaner syntax, top-level `await`, future-proof.

### Q53. What does `nodemon` do?
Watches files and restarts Node on change → faster dev loop. Not used in production.

### Q54. Backend folder structure?
- `controller/` – HTTP layer (parse req, call services, send response).
- `services/` – business logic, talks to DB and AI.
- `routes/` – `express.Router()` definitions.
- `model/` – Mongoose schemas.
- `middleware/` – auth, errorHandler, webhook, rate limit.
- `validators/` – Zod/custom validators.
- `utils/` – `ApiError`, `ApiResponse`, `asyncHandler`, subscription helpers.
- `config/` – plan configuration.
- `constants/` – AI prompts.
- `databse/` – DB connection.

### Q55. Why separate controller and service layers?
Controllers shouldn't know about Mongoose or AI; they only translate HTTP ↔ JS. Services hold reusable business logic, easier to unit-test, and can be reused by jobs/cron without HTTP.

### Q56. Request flow?
`Client → CORS → Helmet → Rate limit → Body parser → Cookie parser → Route → verifyJWT (middleware) → Validator → Controller → Service → Mongoose → MongoDB → Response → errorHandler if thrown`.

### Q57. Role of `asyncHandler.js`?
```1:9:backend/src/utils/asyncHandler.js
const asyncHandler = (requestHandler) => (req, res, next) => {
  Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
}
```
Wraps async controllers so any thrown/rejected error goes to the central `errorHandler` instead of crashing the process. Avoids try/catch in every controller.

### Q58. Central `errorHandler` middleware?
```1:42:backend/src/middleware/errorHandler.js
export const errorHandler = (err, _, res, next) => {
  if (err instanceof ApiError) return res.status(err.statusCode).json({...})
  if (err.name === 'ValidationError') return res.status(400).json({...})
  if (err.name === 'CastError') return res.status(400).json({...})
  ...
}
```
Single place for error shaping. In production, generic 500s say "Something went wrong" so we don't leak stack traces.

### Q59. `app.use()` vs `app.get()`?
`app.use(path?, middleware)` mounts middleware that runs for all matching HTTP methods. `app.get(path, handler)` only handles GET.

### Q60. Why does middleware order matter?
Example from this project: the **webhook route is mounted BEFORE `express.json()`** because Razorpay signature verification needs the **raw, unparsed body**. If JSON parser ran first, `req.body` would already be a JS object and the HMAC would mismatch.

---

## 8. Database – MongoDB + Mongoose

### Q61. Why MongoDB over Postgres/MySQL?
- Schema flexibility (Email's `chatEmails` array of nested chats fits naturally as a sub-document).
- Faster prototyping; no migrations.
- Atlas free tier.
Cons: weaker transactions, no joins (must use `populate` or aggregation).

### Q62. Explain User, Email, Contact models.
- **User**: username, email (unique, regex), password (hashed), authProvider, refreshToken, plan fields (`planId`, `planName`, `planActivatedAt`, `planExpiresAt`), `paymentInfo` sub-document, `isPaidUser`.
- **Email**: prompt, generatedEmail, userId (ref), `chatEmails: [UpdateEmailSchema]` for iterative regenerations. Index `{ userId: 1, createdAt: -1 }` for fast history pagination.
- **Contact**: simple contact-form submissions.

### Q63. Schema vs Model?
A **Schema** defines structure, types, validators, hooks. A **Model** is the compiled class you query (`User.find`, `User.create`). One schema → one model → one MongoDB collection.

### Q64. Pre-save hook example.
```73:78:backend/src/model/User.models.js
UserSchema.pre("save", async function(next) {
  if(!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
```
Hashes the password only when it's set or changed — avoids double-hashing when updating other fields.

### Q65. How does bcrypt work?
- Generates a **random salt** (cost factor 10 here = 2¹⁰ iterations).
- Hashes the salted password with Blowfish-based KDF.
- The resulting string embeds salt + cost + hash, so verification needs only the stored value and the plaintext attempt.

### Q66. What does `unique: true` do?
Creates a **unique index** in MongoDB. Duplicate inserts throw `E11000` error. It's NOT a validator — it's an index. If the index isn't built yet (e.g., existing data), duplicates can sneak in.

### Q67. What is `timestamps: true`?
Mongoose adds `createdAt` and `updatedAt` automatically and updates `updatedAt` on save/update.

### Q68. `findByIdAndUpdate` with `$set`?
`findById` locates by `_id`, `$set` updates only the specified fields (doesn't replace the whole document). `{ new: true }` returns the updated document, `runValidators: true` re-runs schema validators on update.

### Q69. `.lean()` vs normal query?
`.lean()` returns plain JS objects instead of full Mongoose documents — no getters, no virtuals, no `save()` — but ~5-10x faster and lighter memory. Used in `getPaymentHistory` because we only read.

### Q70. Pagination in email history?
```189:200:backend/src/services/email.service.js
const emails = await Email.find({ userId })
  .sort({ createdAt: -1 })
  .limit(limit)
  .skip(page * limit);
```
**Skip-based pagination** — simple but slow on deep pages. For scale I'd switch to **cursor-based** (`createdAt < lastSeen`).

### Q71. Indexes to add?
- `User.email` (unique) — already implicit.
- `Email.userId + createdAt desc` — already added.
- `User.refreshToken` if doing logout-everywhere.

### Q72. N+1 problem here?
Could appear if we fetched a list of emails and then per-email fetched the user. We avoid it by storing `userId` directly and querying by user.

---

## 9. Authentication – JWT + Refresh Tokens + Google OAuth

### Q73. How does JWT auth work here?
- On register/login the backend generates an **access token** (short-lived) and a **refresh token** (long-lived). Both are signed with separate secrets and expiries.
- Access token is set as an **httpOnly cookie** AND returned in the JSON body (for Bearer fallback).
- Every protected route runs `verifyJWT` middleware that decodes the token, fetches the user, and attaches it to `req.user`.

### Q74. Access vs refresh tokens?
- **Access**: short (~15 min). Sent with every request. If stolen, damage window is small.
- **Refresh**: long (~7-30 days). Only sent to `/refresh-token`. Used to mint new access tokens without re-login. Stored hashed in DB so it can be revoked.

### Q75. Where do you store the access token?
**httpOnly cookie** → inaccessible to JS → safe from XSS. The project also keeps it in `localStorage` as a UX guard, which I'd remove in production.

### Q76. Why `httpOnly`, `secure`, `sameSite`?
- `httpOnly`: JS can't read the cookie → mitigates XSS.
- `secure`: cookie only sent over HTTPS → mitigates man-in-the-middle.
- `sameSite=lax/strict`: prevents most CSRF; `none` is needed for cross-site (e.g., frontend on Vercel + API on different domain) and must be combined with `secure`.

### Q77. How does `verifyJWT` work?
```6:48:backend/src/middleware/auth.middleware.js
const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
if (!token) return 401
const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
const account = await UserModel.findById(decodedToken?._id).select("-password -refreshToken");
const freshAccount = await enforceSubscriptionFreshness(account);
req.user = freshAccount;
next()
```
Picks token from cookie or header, verifies signature + expiry, hydrates the user (without sensitive fields), refreshes subscription state, then proceeds.

### Q78. `jwt.sign` vs `jwt.verify`?
- `sign(payload, secret, opts)` returns the encoded token string.
- `verify(token, secret)` validates signature + `exp` claim; throws `JsonWebTokenError` / `TokenExpiredError` on failure.

### Q79. Expired tokens?
`verifyJWT` catches `TokenExpiredError` and returns 401. The frontend interceptor should then call `/refresh-token` (or redirect to login if refresh also expired).

### Q80. Google OAuth flow?
- Frontend uses `@react-oauth/google` to render the Google button and receive an `idToken`.
- Frontend sends it to `/google-auth?token=...`.
- Backend uses `OAuth2Client.verifyIdToken({ idToken, audience: CLIENT_ID })` to verify Google's signature.
- If the email is new → create user with `authProvider: 'google'` and a random password; if existing → use it.
- Mint our own access token and set the cookie.

### Q81. How do you verify Google ID tokens server-side?
`google-auth-library`'s `OAuth2Client.verifyIdToken()` fetches Google's public keys, verifies the JWT signature, checks `iss`, `aud`, `exp`. Without this step, anyone could forge a payload.

### Q82. Google user vs email/password user?
`authProvider` field distinguishes. Google users have a randomly generated bcrypted password so they can't login via the email/password form (it would be infeasible to guess). I could also block password login if `authProvider === 'google'`.

### Q83. Purpose of `authProvider`?
Tracks how a user signed up — useful for analytics, for forcing them to use the right login method, and for skipping "forgot password" for OAuth users.

### Q84. Logout securely?
```149:174:backend/src/controller/user.controller.js
await UserModel.findByIdAndUpdate(req.user?._id, { $unset: { refreshToken: 1 }}, { new: true })
res.status(200).clearCookie("accessToken", options).json({...})
```
Clears the cookie AND wipes the refreshToken from DB so it can't be used elsewhere.

### Q85. Authentication vs authorization?
**Authentication** = who you are (login). **Authorization** = what you can do (plan limits, admin-only endpoints).

### Q86. Implementing role-based access control here?
Add a `role: ['user','admin']` field. Wrap routes in `requireRole('admin')` middleware that checks `req.user.role`. For plan-based gating, the project already uses `enforceSubscriptionFreshness` + `checkMonthlyLimit`.

---

## 10. Security

### Q87. What does Helmet do?
Sets ~15 secure HTTP headers (`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, CSP, etc.). The project explicitly configures **Content Security Policy** to whitelist Razorpay, Google Fonts, and our own domain.

### Q88. Why `'unsafe-inline'` in script-src?
Razorpay Checkout injects inline scripts. Removing `'unsafe-inline'` would break it. Safer alternative: use **nonces** or **hashes** per inline script, but harder to maintain.

### Q89. CORS in this project?
```29:33:backend/src/app.js
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS','HEAD'],
}));
```
A whitelist of trusted origins; `credentials: true` so cookies are sent.

### Q90. Rate limiting?
```41:47:backend/src/app.js
app.use(rateLimit({ windowMs: 15*60*1000, max: 100, ... }))
```
Each IP gets 100 requests per 15 min. Prevents brute-force login, denial-of-service from a single client. For multi-instance deploys I'd use a Redis store.

### Q91. Why mount the webhook BEFORE `express.json()`?
The Razorpay HMAC signature is computed over the **raw request body string**. If `express.json()` parses it first, the original bytes are lost and the signature check will always fail. So we mount the webhook with `express.raw({ type: 'application/json' })`, manually parse inside `webhookMiddleware`, and store the raw string on `req.rawBody`.

### Q92. Why `express.json({ limit: '20kb' })`?
Prevents **payload DOS** — an attacker sending a 100MB JSON could OOM the server. 20kb is more than enough for our prompts.

### Q93. XSS / CSRF / NoSQL injection?
- **XSS**: React auto-escapes JSX output; Helmet CSP blocks inline scripts.
- **CSRF**: protected by `sameSite=lax`/`strict` cookies + custom header (Bearer) for sensitive ops.
- **NoSQL injection**: Mongoose schema casting + Zod input validation prevents `{ $gt: '' }` style queries.

### Q94. Brute-force protection?
Global rate limit (100/15min). For login specifically I'd add a stricter limiter (5 attempts / 10 min / email) and CAPTCHA after N failures.

### Q95. Environment secrets?
Loaded from `.env` via `dotenv`. `.env` is in `.gitignore`. On Vercel, set them in the dashboard env config so they're encrypted at rest.

### Q96. Principle of least privilege?
- DB user has only read/write to the `coldmailer` DB.
- Razorpay key has only "Payment APIs" permission, not "Settlement APIs".
- JWT carries only `_id`, `email`, `username` — not role, plan, etc. (those are looked up fresh from DB).

### Q97. Logging payment signatures?
Never log full signatures, tokens, secrets. The project only logs `userId`, `paymentId`, and error descriptions — never the HMAC.

---

## 11. Validation – Zod

### Q98. Why Zod over Joi / express-validator?
- TypeScript-first; infers types from schema (`z.infer<typeof Schema>`).
- Functional, immutable, composable.
- Smaller bundle than Joi.

### Q99. Zod schema example.
```js
const PromptSchema = z.object({
  prompt: z.string().min(10).max(2000)
})
const parsed = PromptSchema.safeParse(req.body)
if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() })
```

### Q100. Returning validation errors to frontend?
`error.flatten()` gives `{ formErrors, fieldErrors }`. Frontend uses `fieldErrors.email[0]` to display next to inputs.

### Q101. Client vs server validation — why both?
- **Client**: UX — instant feedback, no round-trip.
- **Server**: security — clients can't be trusted (anyone can `curl`).

---

## 12. Payment Integration – Razorpay

### Q102. Full payment flow.
1. **Create Order** (`POST /payment/create-order`): backend creates a Razorpay order with `amount, currency, receipt, notes: { userId, planType }`. Returns `orderId + key`.
2. **Checkout** (frontend): opens Razorpay Checkout modal with `key, order_id`. User pays.
3. **Success callback**: Razorpay returns `razorpay_order_id, razorpay_payment_id, razorpay_signature`.
4. **Verify** (`POST /payment/verify`): backend recomputes `HMAC_SHA256(order_id|payment_id, KEY_SECRET)` and compares with `razorpay_signature`. Also fetches the payment + order from Razorpay to cross-check amount, currency, order ownership, plan.
5. **Activate plan** on user document.
6. **Webhook** (`POST /payment/webhook`): Razorpay independently calls us → second source of truth in case the user closed the browser. Same activation logic, idempotent.

### Q103. Why create the order on the backend?
The frontend can't be trusted with the `key_secret`. The backend signs the amount/currency so users can't tamper with them.

### Q104. Razorpay signature verification.
```148:152:backend/src/controller/payment.controller.js
const body = razorpay_order_id + "|" + razorpay_payment_id;
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(body.toString())
  .digest("hex");
```
Compare with the signature Razorpay sent. If they match, the payment is genuine.

### Q105. `verifyPayment` vs `webhook` — both?
- `verifyPayment` happens **in the user's browser** right after success → instant UI feedback.
- `webhook` is **server-to-server** from Razorpay → reliable even if the user lost connection.
Both go through identical activation logic, guarded by idempotency.

### Q106. Why webhooks if we already verify on callback?
- Users close tabs.
- Networks drop.
- Mobile callbacks fail.
Webhooks guarantee eventual consistency.

### Q107. Idempotency in the webhook.
```499:504:backend/src/controller/payment.controller.js
if (user.paymentInfo?.razorpay_payment_id === razorpay_payment_id) {
  return res.status(200).json({ success: true, message: 'Payment already processed' });
}
```
We check if this `payment_id` has already been recorded. If so, we exit early — preventing double-activation when both the client `verify` and the webhook fire.

### Q108. Why raw body for webhook?
Same reason as Q91: HMAC must be computed over the exact bytes Razorpay signed. We use `express.raw({ type: 'application/json' })` only on the webhook route, then `webhookMiddleware` parses JSON and preserves `req.rawBody`.

### Q109. Signature mismatch?
Return 400. Never activate the plan. Log for monitoring (could indicate tampering or a misconfigured webhook secret).

### Q110. Payment failure handling.
`handlePaymentFailure` records the reason; the frontend shows a friendly toast. We don't activate anything.

### Q111. Tying a Razorpay order to a user.
The `notes` field on the order:
```js
notes: { userId, planType, userEmail, username }
```
During verify/webhook we read these back and check `notes.userId === authenticated userId`. This prevents a user from paying for plan X and getting plan Y, or one user activating another user's plan.

### Q112. Plan expiry & renewal reminder?
`calculatePlanExpiry(activatedAt, plan)` adds the plan's billing period. `getRenewalReminderDate` computes `expiry - REMINDER_WINDOW_DAYS`. `isReminderDue` checks if now is within that window → UI shows a banner.

### Q113. What is `crypto.createHmac`?
Node's built-in HMAC. HMAC = "Hash-based Message Authentication Code" — combines a secret key with a hash function (SHA-256 here) so both sides can verify the message was created by someone who knows the secret AND was not tampered with.

### Q114. Auto-renewal?
I'd switch from one-shot orders to **Razorpay Subscriptions** API. Razorpay handles recurring charges and fires `subscription.charged` webhooks; we just listen and extend `planExpiresAt`.

### Q115. User closes browser mid-payment?
The webhook still fires from Razorpay → plan gets activated. Next time the user logs in, the new plan is reflected.

---

## 13. AI Integration – Google Gemini

### Q116. How did you integrate Gemini?
```22:31:backend/src/index.js
const genAI = new GoogleGenerativeAI(geminiapiKey);
export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
});
```
Single singleton `model` is exported and used by `ai.service.js`.

### Q117. Why `gemini-2.5-flash-lite`?
Cheapest + fastest Gemini model with quality good enough for short-form text. ~200ms p95 latency vs ~1.5s for Pro. Cold emails don't need PhD-level reasoning.

### Q118. `temperature` and `maxOutputTokens`?
- **temperature**: randomness. `0` = deterministic, `1+` = creative. `0.3` gives consistent, professional emails with mild variation.
- **maxOutputTokens**: hard cap on output length. 1000 ≈ 750 words — enough for a long cold email but prevents runaway costs.

### Q119. Prompt design?
A system prompt (`EMAIL_GENERATION_PROMPT`) sets the persona ("expert cold-email writer"), constraints (length, tone, no fluff), and output format. Then the user's prompt is appended. For iterative updates, the previous chats are formatted into the prompt so the model has context.

### Q120. AI failure handling.
```36:56:backend/src/services/ai.service.js
if (error.message?.includes('API_KEY')) return 500 auth error
if (error.message?.includes('quota')) return 503 unavailable
default → 500
```
Each error returns a `{ success, error, statusCode }` object — the service layer surfaces it to the controller.

### Q121. Iterative refinement?
`updateEmailHistoryService` pulls the previous chats, formats them as bullets, builds an `EMAIL_HISTORY_UPDATE_PROMPT` and pushes the new email into the `chatEmails` array.

### Q122. Streaming responses?
Gemini SDK exposes `model.generateContentStream()`. On the backend I'd pipe each chunk to the client via **SSE** (`res.write('data: ...\n\n')`). Frontend listens via `EventSource`. Cuts perceived latency dramatically.

### Q123. Prompt injection?
- Strip system-prompt-looking strings (`"Ignore previous instructions"`) — basic.
- Wrap user input in clear delimiters (`<user_input>...</user_input>`).
- Use **safety settings** in the Gemini SDK to block disallowed content.
- Never put secrets into the prompt.

### Q124. Tracking AI usage per user?
The `Email` collection itself is the usage log; `getMonthlyEmailUsage` aggregates count per user per current month. For granular billing I'd record `tokensUsed` from `result.usageMetadata`.

---

## 14. Email Sending – Nodemailer

### Q125. Why Nodemailer + how does SMTP auth work?
Nodemailer is the de-facto Node email library. SMTP auth uses the configured user/pass to authenticate against the SMTP server (Gmail/SendGrid/SES). Modern providers use **app passwords** or OAuth2 instead of raw passwords.

### Q126. Storing SMTP creds?
In `.env`: `SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS`. Never committed.

### Q127. Transactional vs bulk?
- **Transactional**: triggered by user action (welcome, OTP, receipt). Low volume, high deliverability.
- **Bulk**: marketing blasts. Different IP pools, throttling, unsubscribe links.

### Q128. Email delivery failure / retry?
- Wrap `transporter.sendMail` with try/catch.
- Queue failed sends to **BullMQ** with exponential backoff.
- Track bounces via SMTP server's bounce webhook.

### Q129. Switching to SendGrid / SES later?
Nodemailer just needs a different transport (`nodemailer-sendgrid-transport`). The rest of the code stays the same — that's why we use Nodemailer instead of provider SDKs directly.

---

## 15. Plan / Subscription System

### Q130. Plans config.
`config/paymentPlans.js` exports a `PAYMENT_PLANS` object keyed by plan ID with `amount`, `currency`, `name`, `description`, `features`, `billingPeriod`, `limits`, `requiresPayment`, `buttonText`, `popular`. Adding a new plan = one object literal.

### Q131. Enforcing limits.
`planLimits.js` reads the plan and counts current month's emails (`getMonthlyEmailUsage`). `checkMonthlyLimit` blocks generation if `used >= monthlyLimit`. `checkRegenerationLimit` blocks further regenerations on a single email.

### Q132. `enforceSubscriptionFreshness`?
Called inside `verifyJWT`. If `planExpiresAt < now` and the user is on a paid plan, it downgrades them to Free automatically — so we never serve premium features to expired users even if a webhook missed.

### Q133. Renewal reminder math.
`getRenewalReminderDate(expiresAt, days) = expiresAt - days`. `isReminderDue` returns true if `now` is between `reminderDate` and `expiresAt`. Frontend uses this to show a banner.

### Q134. Plan expiry → auto-downgrade?
Yes — `enforceSubscriptionFreshness` does it lazily on each request. For proactive notifications I'd add a cron job that emails users 2 days before expiry.

---

## 16. Webhooks Deep Dive

### Q135. Webhook secret vs API secret?
- **API secret** (`RAZORPAY_KEY_SECRET`) signs payment-verify HMAC and authenticates API calls.
- **Webhook secret** (`RAZORPAY_WEBHOOK_SECRET`) is a separate secret you set in the dashboard, used only for webhook signatures. Rotating one doesn't affect the other.

### Q136. Testing locally?
Run backend on `localhost:5000`, expose via `ngrok http 5000`, configure the ngrok URL in Razorpay dashboard, trigger test payments. Razorpay also has a "Test webhook" button.

### Q137. Retry policy?
Razorpay retries failed webhooks with backoff up to 24 hours. To stop retries, return **2xx** quickly.

### Q138. Why respond 200 quickly?
Holding the connection blocks Razorpay's worker; long handlers trigger retries → duplicate processing. Best practice: ack 200 immediately, push the actual work to a queue.

### Q139. Async webhook with a queue?
```
Webhook → verify signature → push job to Redis (BullMQ) → return 200
Worker → pick job → fetch order → update user → email receipt
```
Decouples webhook latency from business logic.

---

## 17. Error Handling & Logging

### Q140. `ApiError` and `ApiResponse`?
- `ApiError(statusCode, message, errors[])`: standardized error class. `errorHandler` checks `instanceof ApiError` and returns the right status.
- `ApiResponse(statusCode, data, message)`: standardized success shape `{ statusCode, data, message, success: true }`.

### Q141. Error propagation.
Service throws → `asyncHandler` catches → calls `next(err)` → `errorHandler` middleware shapes the response. Controllers never need try/catch.

### Q142. Operational vs programmer errors.
- **Operational**: expected (bad input, 404). Handle gracefully.
- **Programmer**: bugs (undefined access). Should crash the process; let the orchestrator restart.

### Q143. Logging in production?
Currently `console.error`. For production I'd use **Pino** (JSON logs, fast) + ship to **Datadog/Logtail**, and **Sentry** for unhandled exceptions and frontend errors.

### Q144. Avoiding stack-trace leaks.
```33:36:backend/src/middleware/errorHandler.js
const message = process.env.NODE_ENV === "production" && statusCode === 500
  ? "Something went wrong"
  : (err.message || "Internal Server Error");
```
In production, 5xx messages are masked.

---

## 18. Deployment – Vercel

### Q145. Why Vercel?
- Zero-config for Vite/React.
- Free tier with generous limits.
- Auto-PR previews.
- Serverless functions for the API.

### Q146. `vercel.json`?
```1:24:backend/vercel.json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "/src/index.js" }]
}
```
Tells Vercel: build `src/index.js` as a Node serverless function and route **everything** to it. The Express app handles its own routing internally.

### Q147. How does Express run on Vercel?
Vercel wraps the exported `app` as a serverless function. Each request spins up the handler. We `export default app` — Vercel auto-detects the listener.

### Q148. Cold starts?
A function not invoked recently takes ~300-800ms to initialize (load deps, connect to Mongo). Solutions:
- Keep functions small (avoid heavy deps).
- Use a global Mongo connection cache.
- Warm pings (cron-style) if cost-justified.

### Q149. MongoDB connection caching in serverless?
Each invocation can re-import the file. Without caching you'd open a new connection every time → connection pool exhausted. Our `connectDB` checks `mongoose.connection.readyState === 1` and reuses the existing connection if present:
```5:8:backend/src/databse/db.js
if (mongoose.connection.readyState === 1) {
  console.log("Already connected to MongoDB.");
  return;
}
```

### Q150. Environment variables on Vercel?
Set in Project Settings → Environment Variables (separate for Production/Preview/Development). They're encrypted at rest and injected at runtime.

### Q151. Deploying on Railway/Render/AWS instead?
- **Railway/Render**: same `npm start` command, persistent container — no cold starts. Easier.
- **AWS**: ECS for containers, API Gateway + Lambda for serverless, EC2 for VM. More work, more flexibility.

### Q152. React deploy.
`npm run build` → `vite build` → outputs `dist/`. Vercel serves it as static files via global CDN.

---

## 19. Performance & Optimization

### Q153. Optimizing Vite bundle?
- `manualChunks` to split vendor (`react`, `redux`, `radix`) for better caching.
- `compress: 'gzip'` / `brotli` at the CDN.
- Tree-shake icons (`lucide-react` per-icon imports).
- Avoid huge libs (use day.js over moment).

### Q154. Code splitting / route lazy loading?
`React.lazy(() => import('./page/EmailHistory'))` wrapped in `<Suspense>`. Each route becomes its own chunk, loaded on demand.

### Q155. Caching AI responses?
For deterministic prompts, hash the input and cache the output in Redis with a TTL. Saves cost + latency.

### Q156. Debouncing the prompt input?
Wrap the onChange in `lodash.debounce` (300ms) before triggering any side-effect (e.g., autosave draft). Generation itself is on-click, so not needed there.

### Q157. Redis caching on backend?
- Plan config (`/payment/plans`) — cache forever, bust on deploy.
- User profile — cache for 60s.
- Rate-limit counters.

### Q158. SSR vs CSR vs SSG?
- **CSR**: ColdMailer's frontend — React renders in the browser.
- **SSR**: server renders HTML per request (Next.js).
- **SSG**: HTML generated at build time (static blogs).
We're CSR because the dashboard is user-specific and SEO isn't critical for the app pages. The landing page is a SSG candidate.

---

## 20. Testing & Quality

### Q159. Testing stack?
- **Vitest** for unit tests (Vite-native).
- **React Testing Library** for component tests.
- **Supertest** for Express integration tests.
- **MSW** to mock HTTP in component tests.

### Q160. Testing payment verification?
Mock `razorpayInstance.payments.fetch` and `orders.fetch`. Generate a valid HMAC with a known secret and assert that the user is updated. Then test a tampered signature and assert 400.

### Q161. Mocking Gemini.
Replace `model.generateContent` with `vi.fn().mockResolvedValue({ response: { text: () => 'hi' } })` in setup.

### Q162. ESLint setup.
`eslint.config.js` uses flat config with React Hooks + React Refresh plugins. Catches missing `key`, exhaustive deps, anti-patterns.

---

## 21. Git / Workflow

### Q163. Commits & branches?
`main` is protected. Features in `feat/xyz` branches, PR → review → squash merge. Conventional commits style (`feat:`, `fix:`, `chore:`).

### Q164. `.env` & secrets in git?
Both `Frontend/.env` and `backend/.env` are in `.gitignore`. A committed `.env.example` documents required keys without values.

### Q165. CI/CD?
Add `.github/workflows/ci.yml` that runs `npm ci && npm run lint && npm test` on every PR. Vercel handles deploys automatically on push to `main`.

---

## 22. JavaScript / Node Fundamentals

### Q166. Event loop?
Node's single-threaded loop processes phases: timers → pending callbacks → idle/prepare → poll → check → close. Microtasks (`Promise.then`, `queueMicrotask`) run between every phase. Long sync code blocks everything → use streams / workers for CPU work.

### Q167. `==` vs `===`?
`==` allows type coercion (`0 == '0'` true). `===` is strict (`0 === '0'` false). Always use `===`.

### Q168. Closures.
A function "remembers" its outer scope's variables. Used in `asyncHandler`:
```js
const asyncHandler = (requestHandler) => (req,res,next) => { ... requestHandler ... }
```
The returned function still has access to `requestHandler` after `asyncHandler` returns.

### Q169. `var` vs `let` vs `const`?
- `var`: function-scoped, hoisted, can re-declare → avoid.
- `let`: block-scoped, reassignable.
- `const`: block-scoped, no reassignment (but objects mutable).

### Q170. Promises / async-await.
A Promise is a placeholder for a future value (pending → fulfilled/rejected). `async` functions implicitly return Promises; `await` pauses execution until the Promise settles. Cleaner than `.then()` chains.

### Q171. Destructuring example.
```js
const { username, email, password } = req.body;
const [first, ...rest] = arr;
```

### Q172. Spread vs rest.
Same `...` syntax, opposite intent:
- Spread (expand): `[...arr, 4]`, `{...obj, a:1}`.
- Rest (collect): `function(...args)`, `const [a, ...rest]`.

### Q173. Event delegation.
Attach one listener to a parent; use `event.target` to detect which child fired. Reduces listeners and works for dynamic children.

### Q174. Hoisting.
`var` and function declarations are moved to the top of their scope. `let`/`const` are hoisted but in **Temporal Dead Zone** until declared.

### Q175. `nextTick` vs `setImmediate` vs `setTimeout`?
- `process.nextTick`: microtask, runs before any I/O.
- `setImmediate`: macrotask, runs in the check phase after I/O.
- `setTimeout(fn, 0)`: macrotask, runs in the timers phase (≥1ms in practice).

---

## 23. React Fundamentals

### Q176. Which React hooks did you use?
`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`, `useContext` (Sidebar), `useParams` / `useLocation` / `useNavigate` (router), `useSelector` / `useDispatch` (redux), custom (`usePayment`, `useToast`, `useMobile`).

### Q177. `useState` vs `useReducer`.
- `useState` for simple values.
- `useReducer` when multiple related fields update together or the next state depends on the previous in complex ways.

### Q178. `useEffect` cleanup.
The returned function runs before re-running the effect and on unmount:
```jsx
useEffect(() => {
  const id = setInterval(...); return () => clearInterval(id);
}, [])
```

### Q179. `useMemo` vs `useCallback`.
- `useMemo(fn, deps)`: memoizes the **return value**.
- `useCallback(fn, deps)`: memoizes the **function reference**.
Use to avoid re-rendering children that depend on referential equality.

### Q180. Virtual DOM & reconciliation.
React keeps a lightweight JS tree of the UI. On state change it builds a new tree, **diffs** it against the previous (O(n) with heuristics), and applies the minimal set of real DOM mutations.

### Q181. Controlled vs uncontrolled.
- **Controlled**: input's `value` driven by React state (`<input value={v} onChange={...}/>`).
- **Uncontrolled**: DOM owns the value, you read it via `ref`. `react-hook-form` uses uncontrolled for perf.

### Q182. Prop drilling and avoidance.
Passing props through many layers. Avoided here with Redux (global state) and Context (Sidebar).

### Q183. Keys in lists.
React uses `key` to track which items moved/changed/were removed. Must be stable and unique among siblings. Don't use array index unless the list never reorders.

### Q184. StrictMode.
Wraps the app in `<React.StrictMode>` to surface bugs: double-invokes effects/renders in dev, warns about deprecated APIs.

### Q185. `useRef` vs `useState`.
- `useRef` returns a mutable object that **doesn't trigger re-render** on change.
- `useState` triggers re-render.
Use `useRef` for DOM refs, timers, mutable values you don't render.

---

## 24. System Design / Behavioral

### Q186. AI API costs spike — what do you do?
- Cache identical prompts.
- Tier model by plan (Pro users → bigger model, free → lite).
- Per-user monthly token budget.
- Switch to a cheaper provider/model for free-tier.

### Q187. 10k concurrent email generations?
- Queue requests; workers consume at controlled concurrency.
- Stream partial results via SSE so users see output as it forms.
- Horizontal scale workers, autoscale on queue depth.
- Pre-warm DB connections; use connection pooling.

### Q188. Admin dashboard?
- Add `role: 'admin'` + `requireAdmin` middleware.
- Routes: list users, refund, force-plan-change, view metrics.
- Frontend: separate `/admin` route guarded by role.

### Q189. GDPR.
- "Export my data" endpoint → returns all user + emails as JSON.
- "Delete my account" → cascading delete of emails + payment info, anonymize logs.
- Cookie consent banner; clear privacy policy.

### Q190. Monitoring/alerts?
- **Uptime**: Better Uptime / UptimeRobot on `/health`.
- **APM**: Datadog / New Relic for latency.
- **Errors**: Sentry (FE + BE).
- **Alerts**: PagerDuty for 5xx > 1% / 5min.

### Q191. A bug you fixed.
The Razorpay webhook was failing signature verification because the global `express.json()` middleware ran first, mutating `req.body` into a parsed object. Fixed by mounting the webhook route **before** `express.json()` with `express.raw({type:'application/json'})` and writing `webhookMiddleware` to preserve the raw string on `req.rawBody`. Took half a day to trace.

### Q192. Feature I'm most proud of.
Iterative email refinement — pushing each regeneration into `chatEmails` with the prior conversation re-fed into the prompt. It turned ColdMailer from a one-shot tool into a real conversational drafter, which is what made beta users stick around.

---

> **How to use this doc:** read top-down, but focus your prep on sections **7-13** (Backend, Auth, Security, Payment, AI) — those are where real questions come from in a full-stack interview about this kind of project.
