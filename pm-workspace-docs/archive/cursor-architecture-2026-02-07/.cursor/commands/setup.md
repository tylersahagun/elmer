# PM Workspace Setup

One-time setup command for new collaborators. Run this after cloning the repository.

## What This Does

1. Verifies your system has the required tools
2. Initializes the elephant-ai submodule (AskElephant codebase)
3. Installs dependencies for prototyping
4. Creates your personal work branch
5. Verifies everything works

## Prerequisites Check

Run these checks in order. Stop and help the user fix any issues before proceeding.

### Step 1: Check Node.js Version

```bash
node --version
```

**Required:** Node.js 24 or higher (elephant-ai requirement)

If not installed or wrong version:

- macOS: `brew install node@24` or use nvm: `nvm install 24 && nvm use 24`
- Show the download link: https://nodejs.org/

### Step 2: Check Git Configuration

```bash
git config user.name && git config user.email
```

If either is empty, prompt the user:

```
To save your work, Git needs to know who you are.

What name should appear on your changes? (e.g., "Jane Designer")
> [wait for input]

What's your email? (e.g., "jane@company.com")
> [wait for input]
```

Then run:

```bash
git config user.name "[their name]"
git config user.email "[their email]"
```

### Step 3: Initialize Submodule

```bash
cd /Users/tylersahagun/Source/pm-workspace
git submodule update --init --recursive
```

Verify elephant-ai has content:

```bash
ls elephant-ai/web/package.json
```

If the file doesn't exist, the submodule failed. Check network and try again.

### Step 4: Install Dependencies

```bash
cd /Users/tylersahagun/Source/pm-workspace/elephant-ai
npm install
```

This may take 2-5 minutes. Let the user know it's working.

### Step 5: Create User's Work Branch

Get the user's git username and create their branch:

```bash
# Get username
USERNAME=$(git config user.name | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
DATE=$(date +%Y-%m-%d)
BRANCH="collab/${USERNAME}-${DATE}"

# Create and checkout the branch
git checkout -b "$BRANCH"
git push -u origin "$BRANCH"
```

### Step 6: Copy Environment File

```bash
cp .env.example .env 2>/dev/null || echo "No .env.example found, skipping"
```

### Step 7: Verify Storybook Works

Test that Storybook can start:

```bash
cd /Users/tylersahagun/Source/pm-workspace/elephant-ai
timeout 30 npm run storybook -w web &
sleep 15
curl -s http://localhost:6006 > /dev/null && echo "✅ Storybook works!" || echo "⚠️ Storybook didn't start, but you can try manually"
kill %1 2>/dev/null
```

## Success Message

After all steps complete successfully, display:

```
╔══════════════════════════════════════════════════════════════╗
║                    🎉 Setup Complete!                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Your workspace is ready for prototyping!                    ║
║                                                              ║
║  📁 You're on branch: collab/[username]-[date]               ║
║                                                              ║
║  Quick Commands:                                             ║
║  ─────────────────────────────────────────────────────────── ║
║  /proto [name]    Build a prototype for an initiative        ║
║  /save            Save and push your work                    ║
║  /update          Get latest changes from the team           ║
║  /share           Create a PR for review                     ║
║                                                              ║
║  To run Storybook (see your prototypes):                     ║
║  cd elephant-ai && npm run storybook -w web                  ║
║  Then open: http://localhost:6006                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## Troubleshooting

### "Permission denied" on git push

The user needs to be added as a collaborator on the repository. Contact Tyler.

### Submodule won't initialize

Check if they have access to the elephant-ai repo. They may need to:

1. Set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh
2. Or use HTTPS with a personal access token

### npm install fails

Common fixes:

- Clear npm cache: `npm cache clean --force`
- Delete node_modules and try again: `rm -rf node_modules && npm install`
- Check Node version is 24+

### Storybook won't start

- Make sure you're in the elephant-ai directory
- Try: `cd elephant-ai && npm run storybook -w web`
- Check for port conflicts on 6006

## Re-running Setup

It's safe to run `/setup` again. It will:

- Skip steps that are already complete
- Re-verify everything is working
- Not create duplicate branches (will just check out existing)
