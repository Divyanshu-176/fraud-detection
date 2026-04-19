# Steps: let others use the app over **ngrok**

Use **one public URL** for the whole app. With Docker Compose, the **frontend nginx** on port **8080** already proxies `/api` and `/auth` to the backend, so you only tunnel **8080**.

---

## Prerequisites

1. The stack runs locally and works in a browser:
   - **Docker (recommended):** from repo root, `docker compose up --build`, then open `http://localhost:8080`.
   - **Local dev:** Mongo + ML + backend + `npm run dev` in `frontend/` → usually `http://localhost:5173`.
2. A **GitHub OAuth App** (for login): [GitHub → Settings → Developer settings → OAuth Apps](https://github.com/settings/developers).
3. **ngrok** installed where you run the tunnel (usually **WSL** if Docker runs in WSL):
   - [Download ngrok](https://ngrok.com/download) or `snap install ngrok` on Ubuntu.
   - One-time: `ngrok config add-authtoken <YOUR_TOKEN>` (token from [ngrok dashboard](https://dashboard.ngrok.com/)).

---

## Steps (Docker Compose + ngrok on port 8080)

### 1) Start the app

```bash
cd /path/to/fraud-detection
docker compose up --build
```

Confirm **`http://localhost:8080`** loads and login works **before** ngrok.

### 2) Start a tunnel to the UI port

In another terminal (same machine as Docker):

```bash
ngrok http 8080
```

Copy the **HTTPS** “Forwarding” URL, e.g. `https://abc123.ngrok-free.app` (no trailing slash).

### 3) Update GitHub OAuth app

In your GitHub OAuth app settings:

| Field | Value |
|--------|--------|
| **Homepage URL** | `https://abc123.ngrok-free.app` |
| **Authorization callback URL** | `https://abc123.ngrok-free.app/auth/github/callback` |

Save. (Replace with your real ngrok host.)

### 4) Point the backend at the same public URL

Edit the repo root **`.env`** (create from `env.docker.example` if needed):

```env
FRONTEND_URL=https://abc123.ngrok-free.app
GITHUB_CALLBACK_URL=https://abc123.ngrok-free.app/auth/github/callback
```

Keep `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `JWT_SECRET` / `MONGO_URI` as you already use.

### 5) Restart backend so env is picked up

```bash
docker compose up -d --force-recreate backend
```

(Or `docker compose down` then `up` again.)

### 6) Share the link

Give people:

**`https://abc123.ngrok-free.app`**

They use the same URL for the UI and for GitHub login redirects.

---

## Optional: local Vite dev (port 5173) instead of Docker

1. Run backend on **5000**, frontend `npm run dev` on **5173** (Vite proxies `/api` and `/auth`).
2. `ngrok http 5173`
3. GitHub callback: `https://<ngrok-host>/auth/github/callback`
4. Set **`FRONTEND_URL`** and **`GITHUB_CALLBACK_URL`** in **`backend/.env`** to that `https://<ngrok-host>` (with the same paths as above). Restart backend.

---

## What others will see (free ngrok)

- Browsers may show ngrok’s **interstitial / warning** page once; click **Visit Site**.
- The **URL changes** every time you restart ngrok (free tier). Then you must repeat **steps 3–5** (GitHub app + `.env` + restart).
- For a **stable URL**, use a paid ngrok **reserved domain** and set the same values once.

---

## Checklist if login fails over ngrok

- [ ] `GITHUB_CALLBACK_URL` in **`.env`** exactly matches GitHub’s **Authorization callback URL** (including `https` and path `/auth/github/callback`).
- [ ] **`FRONTEND_URL`** is the same origin (no trailing slash).
- [ ] Backend container was **recreated** after changing `.env`.
- [ ] Tunnel is still running (`ngrok http 8080`) and points at the correct port.

---

## Security note

Anyone with the ngrok link can hit your app. Use strong secrets, do not expose Mongo on ngrok, and **stop ngrok** when you are done demoing.

---

## “Simulation writes to Mongo but my dashboard doesn’t update”

The dashboard **does** load from MongoDB (`/api/transaction/stats` + `/api/transaction/history`) with **your logged-in user’s** `userId`. It is **not** a live WebSocket; it **polls** every few seconds.

### 1) Same browser origin + same login (most common fix)

`localStorage` (where the JWT lives) is **per origin**. These are **different** sessions:

- `http://localhost:8080` …
- `https://your-subdomain.ngrok-free.app` …

So: if **Client A** starts a simulation on **ngrok** while **you** watch the dashboard on **localhost**, your tab uses a **different token / user / empty session** → you will **not** see their stream. **Use the same URL** for everyone you want to demo (e.g. only ngrok), and **log in as the same GitHub user** if you expect one shared view.

**Note:** Data is also **scoped per GitHub user** in the API. Another person’s login sees **their** Mongo rows, not yours.

### 2) Background tab throttling

Browsers slow `setInterval` in background tabs. The app refetches when you **switch back** to the tab (`visibilitychange`) and uses `cache: 'no-store'` on API calls. Rebuild the **frontend** image if you use Docker so nginx + SPA pick up changes.

### 3) “Simulation progress” cards vs Mongo counts

**Job progress** (`simulation_status`) lives in the **Node process memory** on the server that accepted `POST /simulate`. **KPIs / history** come from **Mongo**. If KPIs/history stay flat but Mongo Compass shows rows, check **same userId** and **same origin** as above.

### 4) Rebuild after nginx change

If you use Docker: `docker compose build frontend && docker compose up -d` after updating `nginx.conf`.
