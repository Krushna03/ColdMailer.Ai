# ColdMailer.Ai — Frontend

The React single-page application for **ColdMailer.Ai**, an AI-powered cold-email generator. It provides the landing/marketing site, authentication (email/password + Google OAuth), the email generation workspace, email history, and the subscription/payment flow.

> This is the client half of the project. The API it talks to lives in the sibling [`backend/`](../backend) folder.

---

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | [React 19](https://react.dev/) |
| Build tool | [Vite 6](https://vite.dev/) |
| Routing | [React Router DOM 7](https://reactrouter.com/) |
| Client state | [Redux Toolkit](https://redux-toolkit.js.org/) + [React Redux](https://react-redux.js.org/) |
| Server state / data fetching | [TanStack Query 5](https://tanstack.com/query/latest) (`@tanstack/react-query` + devtools) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [tailwind-merge](https://github.com/dcastil/tailwind-merge) + `tailwindcss-animate` |
| UI primitives | [Radix UI](https://www.radix-ui.com/), [shadcn-style components](https://ui.shadcn.com/) |
| Icons | [lucide-react](https://lucide.dev/), [react-icons](https://react-icons.github.io/react-icons/) |
| Forms | [react-hook-form](https://react-hook-form.com/) |
| HTTP client | [axios](https://axios-http.com/) |
| Auth | [@react-oauth/google](https://github.com/MomenSherif/react-oauth), [jwt-decode](https://github.com/auth0/jwt-decode) |

---

## Features

- **Marketing landing page** — hero, pricing, FAQ, testimonials, contact form, and call-to-action sections.
- **Authentication** — email/password sign-up & sign-in plus Google OAuth login. JWT is stored client-side and attached to every API request.
- **AI email generation** — prompt-based cold-email generation with iterative refinement (chat-style revisions).
- **Email history** — browse, view, refine, and delete previously generated emails with pagination.
- **Subscriptions & payments** — Razorpay checkout for upgrading plans, plan usage notices, and payment history.
- **Protected routes** — authenticated-only pages guarded by a `Protected` wrapper.
- **Responsive UI** — mobile-friendly layout with a collapsible sidebar and toast notifications.
- **Cached data layer** — all server reads/writes go through TanStack Query hooks for caching, request de-duplication, and automatic refresh via cache invalidation (no manual refetch state).

---

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ (recommended 20+)
- npm (bundled with Node.js)
- A running instance of the ColdMailer backend (see [`backend/README.md`](../backend/README.md))

---

## Getting Started

### 1. Install dependencies

```bash
cd Frontend
npm install
```

### 2. Configure environment variables

Create a `.env` file in the `Frontend/` directory:

```bash
# Base URL of the backend API (no trailing slash)
VITE_BASE_URL=http://localhost:5000

# Google OAuth Client ID (must match the backend's GOOGLE_CLIENT_ID)
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_BASE_URL` | Yes | Base URL of the backend REST API. Used by the axios instance in `src/utils/api.js`. |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 client ID used by `GoogleOAuthProvider`. |

> Vite only exposes variables prefixed with `VITE_` to the client. Restart the dev server after changing `.env`.

### 3. Run the development server

```bash
npm run dev
```

The app starts on [http://localhost:5173](http://localhost:5173) by default.

---

## Available Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot module replacement. |
| `npm run build` | Produce an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally for previewing. |
| `npm run lint` | Run ESLint across the project. |

---

## Project Structure

```
Frontend/
├── public/                     # Static assets served as-is
├── src/
│   ├── App.jsx                 # Route definitions (React Router)
│   ├── main.jsx                # App entry: providers (Google OAuth, Redux, React Query, Sidebar, Tooltip)
│   ├── index.css               # Global styles / Tailwind entry
│   │
│   ├── landing/                # Marketing/landing page sections
│   │   ├── Landing.jsx
│   │   ├── Pricing.jsx
│   │   ├── Faq.jsx
│   │   ├── Contact.jsx
│   │   ├── Testimonials.jsx
│   │   ├── CallToAction.jsx
│   │   └── Footer.jsx
│   │
│   ├── pages/                  # Top-level routed pages
│   │   ├── GenerateEmail.jsx   # Email generation workspace
│   │   ├── EmailOutputPage.jsx # Generated email output view
│   │   ├── EmailHistory.jsx    # Paginated email history
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── GoogleLogin.jsx
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   ├── Protected.jsx       # Route guard for authenticated pages
│   │   ├── NotFound.jsx
│   │   ├── EmailGenerator.jsx
│   │   ├── EmailInput.jsx
│   │   ├── EmailOutput.jsx
│   │   ├── EmailHistoryCard.jsx
│   │   ├── Payment.jsx
│   │   ├── PlanUsageNotice.jsx
│   │   ├── MovingDots.jsx
│   │   ├── payment/            # Payment flow sub-components
│   │   └── ui/                 # shadcn/Radix-based primitives (button, card, toast, ...)
│   │
│   ├── context/                # Redux store + slices, sidebar context
│   │   ├── store.js
│   │   ├── authSlice.js
│   │   ├── SidebarContext.js
│   │   └── SidebarContextProvider.jsx
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── queryKeys.js        # Centralized React Query key factory
│   │   ├── useEmail.js         # Email queries + generate/iterate/delete mutations
│   │   ├── useUser.js          # User count + current-user queries
│   │   ├── useAuth.js          # Login/register/google + contact mutations
│   │   ├── usePlanUsage.js     # Plan usage query
│   │   ├── usePayment.js       # Payment plans/history queries + Razorpay orchestration
│   │   ├── useErrorToast.js
│   │   ├── useKeyboardOffset.js
│   │   ├── use-toast.js
│   │   └── use-mobile.jsx
│   │
│   ├── utils/                  # api client, localStorage, clipboard, string/email/error helpers
│   ├── lib/                    # queryClient (React Query config), email extraction & post-processing, cn util
│   ├── data/                   # Static content (pricing, landing, faq, testimonials)
│   ├── loaders/                # Loading skeletons/spinners (PageLoader, SidebarLoader, Loader)
│   └── helpers/                # tokenValidation (token parsing, expiry, logout)
│
├── vite.config.js             # Vite config + "@" alias to src/
├── tailwind.config.js
├── eslint.config.js
├── components.json            # shadcn component config
└── vercel.json                # SPA rewrite rules for Vercel
```

---

## Routing

Routes are defined in `src/App.jsx`:

| Path | Component | Access |
| --- | --- | --- |
| `/` | `LandingPage` | Public |
| `/sign-in` | `LoginPage` | Public |
| `/sign-up` | `RegisterPage` | Public |
| `/generate-email` | `GenerateEmail` | Protected |
| `/email/:id` | `EmailOutputPage` | Protected |
| `/email/history/:id` | `EmailHistory` | Protected |
| `/payment` | `PaymentComponent` | Protected |
| `*` | `NotFound` | Public |

Protected routes are wrapped in `<Protected>`, which verifies authentication before rendering.

---

## API Communication

All HTTP traffic goes through a shared axios instance in `src/utils/api.js`:

- Base URL comes from `VITE_BASE_URL`.
- Requests are sent with `withCredentials: true` (cookies) and a `Bearer` token from local storage.
- On a `401` response for a protected endpoint, the token is cleared and the user is redirected to `/sign-in`.

### Data layer (TanStack Query)

Components never call axios directly — every read/write is wrapped in a React Query hook. The client and its defaults live in `src/lib/queryClient.js` and are provided app-wide by `QueryClientProvider` in `main.jsx` (React Query Devtools are mounted in dev only).

- **Queries (`useQuery`)** — reads (GET). Cached by a key from `src/hooks/queryKeys.js`; results are reused/de-duped across components. Defaults: `staleTime: 60s`, `refetchOnWindowFocus: false`, and retries are disabled on `4xx` so RQ doesn't fight the axios `401` redirect.
- **Mutations (`useMutation`)** — writes (POST/PATCH/DELETE). Each hook's `onSuccess` keeps the cache in sync via `invalidateQueries` (mark stale → refetch) or `setQueryData` (patch in place); components pass their own `onSuccess`/`onError` for toasts and navigation.
- **`enabled`** gates queries on auth (e.g. plan usage / current user only run with a valid token).
- **Logout** calls `queryClient.clear()` to purge all cached data.

Hooks by domain: `useEmail` (email detail, infinite history, generate/iterate/delete), `useUser` (user count, current user), `useAuth` (login/register/google/contact), `usePlanUsage`, and `usePayment` (plans/history + Razorpay checkout orchestration).

---

## Building for Production

```bash
npm run build
```

The output is emitted to `dist/`. Preview it locally with `npm run preview`.

### Deployment (Vercel)

`vercel.json` contains SPA rewrite rules so client-side routes resolve to `index.html`. Set `VITE_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in the Vercel project's environment variables before deploying.

---

## Related

- Backend API & setup: [`backend/README.md`](../backend/README.md)
