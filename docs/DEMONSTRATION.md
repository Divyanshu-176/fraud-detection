# What each thing is (and how it differs)

| Term | What it is | How it differs from the others |
|------|------------|----------------------------------|
| **CI/CD** | *Practice + automation*: build, test, deploy on every change. | Not a single product — it’s the **goal**. Jenkins (or GitHub Actions, etc.) **implements** CI/CD. |
| **Jenkins** | A **CI server** that runs jobs/pipelines (shell steps, Docker builds, tests). | The **orchestrator**. Docker is what Jenkins often **calls** to build images. |
| **Docker** | **Tooling** to build and run **images** (buildfiles, CLI, Compose). | The **packaging/runtime** layer. “Container” is what Docker runs *from* an image. |
| **Container** | A **running instance** of an image (isolated process + filesystem). | One **running** unit. An **image** is the frozen recipe; many containers can start from one image. |
| **Webhook** | An **HTTP callback**: GitHub (etc.) POSTs to a URL when an event happens (e.g. push). | The **trigger** into Jenkins — replaces “poll every minute.” |
| **ngrok** | A **public tunnel** to a port on your machine (HTTPS URL → localhost). | **Network helper** so GitHub’s webhook can reach **Jenkins on your laptop** without opening your router. |

**One-line story:**  
You **push** code → **GitHub webhook** hits a URL → **ngrok** forwards that to **Jenkins** on your PC → **Jenkins** runs **CI/CD** (pipeline) → pipeline uses **Docker** to **build** images → **containers** run your stack for test/demo.

---

# What exists in *this* repo today

| Piece | Where in the project | What you can show |
|--------|----------------------|-------------------|
| **Docker / containers** | `docker-compose.yml`, `ml-service/Dockerfile`, `backend/Dockerfile`, `frontend/Dockerfile` | Run `docker compose up --build`, open `http://localhost:8080`, show `docker ps` (running **containers**). |
| **CI/CD (idea)** | Same pipeline automates “build images on change” | Explain stages: checkout → build → (optional) deploy. |
| **Jenkins** | `Jenkinsfile` at repo root | In Jenkins: New Pipeline → from SCM → run build; show console log running `docker compose build`. |
| **Webhook** | *Not stored in repo* — configured in **GitHub** + **Jenkins** UI | Screenshots: GitHub → Repo → **Settings → Webhooks** (Payload URL pointing to Jenkins or ngrok URL). |
| **ngrok** | *Not stored in repo* — you run it on the machine that hosts Jenkins | Terminal: `ngrok http 8080` (or Jenkins port), copy HTTPS URL into GitHub webhook. |

---

# What you need to do to “show everything” in a demo

1. **Docker** — From repo root: `docker compose up --build`. Show **containers** with `docker ps` / Docker Desktop.  
2. **Jenkins** — Install “Pipeline” plugin if needed. Job: Pipeline from SCM, branch with this repo. Run job manually first.  
3. **Webhook** — Jenkins: enable **GitHub** integration (or “Generic Webhook” / “Multibranch” as you prefer). GitHub: add webhook URL Jenkins gives you **or** `https://<subdomain>.ngrok-free.app/github-webhook/` (path depends on plugin — use Jenkins docs for exact path).  
4. **ngrok** — Only if Jenkins is **not** on a public URL. Run ngrok on the **same host as Jenkins**, tunnel to Jenkins HTTP port, paste that URL into GitHub webhook.  
5. **CI/CD narrative** — Say: “On every push, webhook fires → Jenkins runs `Jenkinsfile` → `docker compose build` validates the stack.”

**Note:** Your `Jenkinsfile` currently only runs **`docker compose build`**. That is enough to demonstrate CI + Docker; add a `npm test` / lint stage later if you want more “CD” depth.
