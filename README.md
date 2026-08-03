# ⚓ Penutx

A self-hosted dashboard for your Docker containers, with one-click updates powered by [Watchtower](https://github.com/containrrr/watchtower). Think Homarr's container view crossed with Unraid's "update available" button.

Penutx itself never pulls images or recreates containers — it reads container state straight off the Docker socket, checks registries for newer digests, and asks Watchtower's HTTP API to do the actual update. That keeps the risky part of "swap a running container's image" in a project that's already solved it well.

## Quick start

1. Clone this repo and `cd` into it.
2. Copy the env file and set a token:
   ```bash
   cp .env.example .env
   # edit .env and set WATCHTOWER_HTTP_API_TOKEN to something random
   # (openssl rand -hex 32)
   ```
3. Start it:
   ```bash
   docker compose up -d --build
   ```
4. Open `http://localhost:3000`.

By default Watchtower only manages containers labeled to opt in. Add this label to any container you want Penutx to be able to update:

```yaml
labels:
  - com.centurylinklabs.watchtower.enable=true
```

If you'd rather Penutx manage *every* container by default, remove `WATCHTOWER_LABEL_ENABLE=true` from the `watchtower` service in `docker-compose.yml`.

## How it works

```
┌────────────┐   reads containers/images    ┌──────────────┐
│   Penutx   │ ────────────────────────────▶│ Docker socket │
│  (Next.js) │                               └──────────────┘
│            │   checks manifest digests     ┌──────────────┐
│            │ ────────────────────────────▶│   Registry    │
│            │                               └──────────────┘
│            │   POST /v1/update (per image) ┌──────────────┐
│            │ ────────────────────────────▶│  Watchtower   │
└────────────┘                               └──────────────┘
```

- `src/lib/docker.ts` — lists/inspects containers via [dockerode](https://github.com/apocas/dockerode).
- `src/lib/registry.ts` — checks the Docker Registry HTTP API v2 for a newer manifest digest than the one the running container was created from. Docker Hub and unauthenticated v2 registries are supported out of the box; see the comment in that file for adding private-registry auth.
- `src/lib/watchtower.ts` — calls Watchtower's HTTP API to trigger an update, optionally scoped to one image.

## Running without Docker Compose

Penutx needs two things at runtime:

- The Docker socket mounted read-only at `/var/run/docker.sock` (or set `DOCKER_HOST` for a remote/TCP Docker daemon).
- Network access to a Watchtower instance with its HTTP API enabled, plus `WATCHTOWER_URL` and `WATCHTOWER_HTTP_API_TOKEN` set to match.

## Local development

```bash
npm install
npm run dev
```

You'll still need a Docker socket available and a Watchtower instance running somewhere for updates to work; read-only container listing works with just the socket.

## Roadmap / good first issues

- [ ] Homarr-style app-link tiles alongside the container list
- [ ] Per-container CPU/RAM stats and log viewer in the UI (API routes already exist: `/api/containers/[id]/logs`)
- [ ] Private registry auth (Docker Hub private repos, GHCR, ECR)
- [ ] Auth/login for exposing Penutx outside localhost
- [ ] Compose-stack grouping (show containers under their `docker-compose` project)

Contributions welcome — open a PR or issue.

## Publishing your own image

The included `.github/workflows/publish.yml` builds and pushes to GHCR (`ghcr.io/<your-github-username>/penutx`) on every push to `main` and on version tags. Enable GitHub Actions on your fork/repo and it'll publish automatically — no extra secrets needed beyond the default `GITHUB_TOKEN`.

## License

MIT — see [LICENSE](LICENSE).
