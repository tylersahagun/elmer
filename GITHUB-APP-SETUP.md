# GitHub App Setup for Elmer

Elmer uses a GitHub App ("Elmer Bot") instead of a personal access token so that:
- Commits to `elephant-ai` appear as **elmer-bot**, not your personal account
- Access is scoped to only the repos that need it
- Installation tokens auto-expire in 1 hour and regenerate — no manual rotation

---

## Step 1: Create the GitHub App

1. Go to **https://github.com/settings/apps/new**
   (or org-level: https://github.com/organizations/AskElephant/settings/apps/new)

2. Fill in the form:
   - **GitHub App name:** `Elmer Bot`
   - **Homepage URL:** `https://github.com/tylersahagun/elmer`
   - **Webhook URL:** `https://<your-convex-site-url>/webhooks/github`
     (find this in your Convex dashboard → Settings → URL, it ends in `.convex.site`)
   - **Webhook secret:** generate with `openssl rand -base64 32` and save it
   - **Webhook active:** ✅ checked

3. Set **Repository permissions**:
   | Permission | Level |
   |---|---|
   | Contents | Read & write |
   | Metadata | Read-only (required) |

4. Set **Subscribe to events**:
   - ✅ Push

5. Set **Where can this GitHub App be installed?**
   - "Only on this account" (it's internal-only)

6. Click **Create GitHub App**

---

## Step 2: Generate the Private Key

On the App settings page (you'll be redirected there after creation):

1. Scroll to **Private keys** → click **Generate a private key**
2. A `.pem` file downloads automatically
3. Base64-encode it for use as an env var:
   ```bash
   base64 < ~/Downloads/elmer-bot.*.private-key.pem | tr -d '\n'
   ```
4. Copy the output — this is your `GITHUB_APP_PRIVATE_KEY_B64`

Note your **App ID** at the top of the page (e.g. `1234567`).

---

## Step 3: Install the App on the repos

1. On the App settings page → click **Install App** in the left sidebar
2. Click **Install** next to your account / AskElephant org
3. Select **Only select repositories** and choose:
   - `tylersahagun/elmer` (or `AskElephant/pm-workspace` — wherever `.cursor/` agent files live)
   - `AskElephant/elephant-ai`
4. Click **Install**

After installing, look at the URL in your browser:
```
https://github.com/settings/installations/12345678
```
The number at the end is your **Installation ID**.

---

## Step 4: Add the webhook secret to GitHub

On the **repo settings** for `tylersahagun/elmer` (or `AskElephant/pm-workspace`):
1. Settings → Webhooks → the webhook you registered in Step 1
2. Confirm the **Secret** matches what you set — this is `GITHUB_WEBHOOK_SECRET`

---

## Step 5: Set env vars in Convex

In the **Convex dashboard** → your project → Settings → Environment Variables:

| Variable | Value |
|---|---|
| `GITHUB_APP_ID` | The numeric App ID from Step 2 (e.g. `1234567`) |
| `GITHUB_APP_PRIVATE_KEY_B64` | Base64-encoded PEM from Step 2 |
| `GITHUB_APP_INSTALLATION_ID` | The installation ID from Step 3 (e.g. `12345678`) |
| `GITHUB_WEBHOOK_SECRET` | The secret you set in Step 1 & 4 |

You can remove `GITHUB_TOKEN` once you've verified the App works.

---

## Step 6: Verify

Trigger a pm-workspace sync from Elmer:
1. Go to Elmer → Workspace Settings → click "Sync Agents"
2. Watch job logs — should show files being fetched from GitHub with no auth errors
3. Or push a commit to the pm-workspace repo and verify the webhook fires

To confirm commits come from the Bot:
1. Trigger a prototype agent to write a file to `elephant-ai`
2. Check the commit history — should show **elmer-bot** as the author

---

## How It Works in the Code

```
convex/tools/githubAuth.ts    ← generates App tokens
convex/tools/codebase.ts      ← uses githubAuth for all file read/write/search
convex/agents.ts              ← uses githubAuth for pm-workspace sync
convex/http.ts                ← verifies webhook signatures with GITHUB_WEBHOOK_SECRET
```

Auth priority in `githubAuth.ts`:
1. GitHub App installation token (preferred — uses GITHUB_APP_* vars)
2. Workspace `settings.githubToken` override (per-workspace PAT, for migration)
3. `GITHUB_TOKEN` env var (PAT fallback for local development only)
