# Azaruddin A M — Portfolio

Personal portfolio of **Azaruddin A M**, full-stack developer (Angular · .NET · Node.js).
Live at **https://azaruddin.velouraone.in**.

| Folder | What it is |
| --- | --- |
| [`client/`](client) | Angular 21 site (standalone components, signals, zoneless) |
| [`api/`](api) | ASP.NET Core (.NET 10) Web API: portfolio data and contact form |
| [`client/public/data/portfolio.json`](client/public/data/portfolio.json) | **All site content.** Edit this one file to update the portfolio |
| [`.github/workflows/ci-deploy.yml`](.github/workflows/ci-deploy.yml) | Build, test and deploy to Hostinger |

## How it works

- The Angular site is static, so it runs on Hostinger web hosting.
- It reads `data/portfolio.json`. When `apiUrl` is set in `client/src/environments/environment.ts`, it loads from the .NET API first and falls back to the static file if the API is down.
- With no API, the contact form opens the visitor's email app. With the API, messages are posted to `/api/contact` (validated, rate-limited to 5 per 10 minutes per IP, saved to `App_Data/messages.jsonl`).
- The API reads the same `portfolio.json`, so there is one source of content.

## Run locally

Requires Node 20.19+ (24 recommended) and the .NET 10 SDK.

```bash
dotnet run --project api/src/Portfolio.Api --launch-profile http   # http://localhost:5080
```

```bash
cd client && npm install && npm start                              # http://localhost:4200
```

Tests:

```bash
cd client && npx ng test --watch=false
```

```bash
dotnet test api/Portfolio.sln
```

## Deployment (GitHub Actions → Hostinger)

Every push to `main` runs the Angular and .NET tests, builds both, and uploads the site to Hostinger over FTPS.

One-time setup:

1. **hPanel → Domains → Subdomains**: create `azaruddin.velouraone.in`. Note its folder (e.g. `public_html/azaruddin`).
2. **hPanel → Files → FTP Accounts**: create an FTP account whose directory is that subdomain folder.
3. **GitHub repo → Settings → Secrets and variables → Actions**, add secrets:
   - `FTP_USERNAME`: the FTP account user
   - `FTP_PASSWORD`: its password
4. Add the **variable** `FTP_SERVER_DIR` (required): the subdomain's folder as seen from the FTP account, ending in `/` (e.g. `./azaruddin/`). Deploy is skipped while it is empty or points at the FTP root, so the main velouraone.in site is never overwritten. Optional variable `FTP_SERVER` overrides the default host `ftp.velouraone.in`.
5. **hPanel → Security → SSL**: install SSL for the subdomain and turn on Force HTTPS.
6. Re-run the workflow (Actions → Build, test & deploy → Run workflow).

Without the secrets the deploy job is skipped with a warning, and the build still runs.

### Hosting the .NET API

Hostinger web hosting does not run .NET. The workflow publishes the API as a build artifact (`api`). To go live, host it on any .NET host (a Hostinger VPS, Azure App Service, etc.), then set `apiUrl` in `client/src/environments/environment.ts` and add the site origin to `Cors:AllowedOrigins` in `appsettings.json`.
