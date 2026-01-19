# Local Development Environment

Set up and verify the local development environment with Docker PostgreSQL and Cloudflare Tunnel.

## Usage

- `/local` - Start local dev environment (Docker + PostgreSQL + migrations + dev server + tunnel)
- `/local status` - Check status of local services
- `/local reset` - Reset database to clean state
- `/local tunnel` - Start only the Cloudflare tunnel (for when services are already running)

## What This Does

1. Checks Docker is running
2. Starts PostgreSQL container if needed
3. Waits for database to be healthy
4. Runs any pending migrations
5. Starts the dev server (if not already running)
6. Starts Cloudflare Tunnel to expose at https://elmer.studio

---

## Process

### Step 1: Check Docker

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo "🐳 Docker is not running. Starting Docker Desktop..."
    open -a Docker
    
    # Wait for Docker to start (max 30 seconds)
    for i in {1..30}; do
        if docker info > /dev/null 2>&1; then
            echo "✅ Docker is ready!"
            break
        fi
        sleep 1
    done
    
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker failed to start. Please start Docker Desktop manually."
        exit 1
    fi
else
    echo "✅ Docker is running"
fi
```

### Step 2: Start PostgreSQL

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

# Check if container exists and is running
if docker ps --format '{{.Names}}' | grep -q '^elmer-postgres$'; then
    echo "✅ PostgreSQL container is already running"
else
    # Check if container exists but is stopped
    if docker ps -a --format '{{.Names}}' | grep -q '^elmer-postgres$'; then
        echo "🔄 Starting existing PostgreSQL container..."
        docker start elmer-postgres
    else
        echo "🚀 Creating and starting PostgreSQL container..."
        docker compose up -d
    fi
fi
```

### Step 3: Wait for Database Health

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

echo "⏳ Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec elmer-postgres pg_isready -U elmer -d orchestrator > /dev/null 2>&1; then
        echo "✅ PostgreSQL is healthy and accepting connections"
        break
    fi
    sleep 1
done

# Verify connection
if ! docker exec elmer-postgres pg_isready -U elmer -d orchestrator > /dev/null 2>&1; then
    echo "❌ PostgreSQL failed to become healthy"
    echo "Try: docker compose down && docker compose up -d"
    exit 1
fi
```

### Step 4: Run Migrations

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

echo "🔄 Running database migrations..."
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator" npm run db:migrate

if [ $? -eq 0 ]; then
    echo "✅ Migrations complete"
else
    echo "❌ Migration failed"
    exit 1
fi
```

### Step 5: Check/Start Dev Server

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

# Check if dev server is already running on port 3000
if lsof -i :3000 | grep -q LISTEN; then
    echo "✅ Dev server is already running at http://localhost:3000"
else
    echo "🚀 Starting dev server..."
    npm run dev &
    
    # Wait for server to start
    for i in {1..15}; do
        if curl -s http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Dev server started at http://localhost:3000"
            break
        fi
        sleep 1
    done
fi
```

### Step 6: Start Cloudflare Tunnel

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

# Check if tunnel is already running
if pgrep -f "cloudflared tunnel run elmer" > /dev/null; then
    echo "✅ Cloudflare Tunnel is already running"
else
    echo "🌐 Starting Cloudflare Tunnel..."
    cloudflared tunnel run elmer &
    
    # Wait for tunnel to connect
    sleep 3
    
    # Verify tunnel is running
    if pgrep -f "cloudflared tunnel run elmer" > /dev/null; then
        echo "✅ Cloudflare Tunnel connected"
    else
        echo "⚠️  Tunnel may have failed to start. Check: cloudflared tunnel info elmer"
    fi
fi
```

### Step 7: Success Message

```
╔═══════════════════════════════════════════════════════════════╗
║              🚀 Local Environment Ready!                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Services:                                                    ║
║  ─────────────────────────────────────────────────────────── ║
║  ✅ Docker           Running                                  ║
║  ✅ PostgreSQL       localhost:5432                           ║
║  ✅ Migrations       Applied                                  ║
║  ✅ Dev Server       http://localhost:3000                    ║
║  ✅ Tunnel           https://elmer.studio                     ║
║                                                               ║
║  Public URL:                                                  ║
║  ─────────────────────────────────────────────────────────── ║
║  🌐 https://elmer.studio                                      ║
║                                                               ║
║  Database:                                                    ║
║  ─────────────────────────────────────────────────────────── ║
║  • Host:     localhost:5432                                   ║
║  • Database: orchestrator                                     ║
║  • User:     elmer                                            ║
║  • Password: elmer_local_dev                                  ║
║                                                               ║
║  Quick Commands:                                              ║
║  ─────────────────────────────────────────────────────────── ║
║  docker compose stop       Stop PostgreSQL                    ║
║  docker compose down -v    Reset database completely          ║
║  npm run db:studio         Open Drizzle Studio                ║
║  pkill -f cloudflared      Stop Cloudflare Tunnel             ║
║                                                               ║
║  Note: Site is only available when this Mac is running!       ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Status Variant

When running `/local status`:

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

echo "🔍 Checking local environment status..."
echo ""

# Docker
if docker info > /dev/null 2>&1; then
    echo "✅ Docker: Running"
else
    echo "❌ Docker: Not running"
fi

# PostgreSQL container
if docker ps --format '{{.Names}}' | grep -q '^elmer-postgres$'; then
    echo "✅ PostgreSQL Container: Running"
    
    # Check health
    if docker exec elmer-postgres pg_isready -U elmer -d orchestrator > /dev/null 2>&1; then
        echo "✅ PostgreSQL Health: Accepting connections"
    else
        echo "⚠️  PostgreSQL Health: Not ready"
    fi
    
    # Table count
    TABLE_COUNT=$(docker exec elmer-postgres psql -U elmer -d orchestrator -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | tr -d ' ')
    echo "📊 Tables: $TABLE_COUNT"
else
    echo "❌ PostgreSQL Container: Not running"
fi

# Dev server
if lsof -i :3000 | grep -q LISTEN; then
    echo "✅ Dev Server: Running at http://localhost:3000"
else
    echo "❌ Dev Server: Not running"
fi

# Cloudflare Tunnel
if pgrep -f "cloudflared tunnel run elmer" > /dev/null; then
    echo "✅ Cloudflare Tunnel: Running (https://elmer.studio)"
else
    echo "❌ Cloudflare Tunnel: Not running"
fi

# Check public URL
if curl -s -o /dev/null -w "%{http_code}" https://elmer.studio 2>/dev/null | grep -q "200"; then
    echo "✅ Public URL: https://elmer.studio is accessible"
else
    echo "⚠️  Public URL: https://elmer.studio may not be accessible"
fi

# Environment file
if [ -f ".env.local" ]; then
    echo "✅ .env.local: Present"
    
    # Check for local DB URL
    if grep -q "localhost:5432" .env.local; then
        echo "✅ DATABASE_URL: Configured for local"
    elif grep -q "neon.tech" .env.local; then
        echo "⚠️  DATABASE_URL: Still using Neon (remote)"
    fi
else
    echo "❌ .env.local: Missing"
fi
```

---

## Tunnel Variant

When running `/local tunnel`:

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

# Check if tunnel is already running
if pgrep -f "cloudflared tunnel run elmer" > /dev/null; then
    echo "✅ Cloudflare Tunnel is already running"
    echo "🌐 Site available at: https://elmer.studio"
else
    echo "🌐 Starting Cloudflare Tunnel..."
    cloudflared tunnel run elmer &
    
    sleep 3
    
    if pgrep -f "cloudflared tunnel run elmer" > /dev/null; then
        echo "✅ Tunnel connected!"
        echo "🌐 Site available at: https://elmer.studio"
    else
        echo "❌ Tunnel failed to start"
        echo "Try: cloudflared tunnel info elmer"
    fi
fi
```

---

## Reset Variant

When running `/local reset`:

```bash
cd /Users/tylersahagun/Source/elmer/orchestrator

echo "⚠️  This will DELETE all local database data!"
echo ""

# Stop and remove container + volume
echo "🗑️  Removing PostgreSQL container and data..."
docker compose down -v

# Recreate
echo "🚀 Creating fresh PostgreSQL instance..."
docker compose up -d

# Wait for health
echo "⏳ Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec elmer-postgres pg_isready -U elmer -d orchestrator > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Run migrations
echo "🔄 Running migrations on fresh database..."
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator" npm run db:migrate

echo ""
echo "✅ Database reset complete! Fresh start."
```

---

## Stop All Services

To stop everything:

```bash
# Stop the tunnel
pkill -f "cloudflared tunnel run elmer"

# Stop the dev server
pkill -f "next dev"

# Stop PostgreSQL
cd /Users/tylersahagun/Source/elmer/orchestrator
docker compose stop
```

---

## Troubleshooting

### Docker won't start

```
⚠️ Docker failed to start automatically.

Try:
1. Open Docker Desktop manually
2. Wait for it to fully start (whale icon in menu bar)
3. Run /local again
```

### PostgreSQL container keeps restarting

```bash
# Check logs
docker logs elmer-postgres

# Common fixes:
docker compose down
docker volume rm orchestrator_postgres_data  # Remove corrupted data
docker compose up -d
```

### Port 5432 already in use

```bash
# Find what's using the port
lsof -i :5432

# If it's another PostgreSQL, stop it:
brew services stop postgresql  # If installed via Homebrew

# Or change the port in docker-compose.yml:
# ports:
#   - "5433:5432"
# Then update DATABASE_URL to use port 5433
```

### Migrations fail

```bash
# Check if database exists
docker exec elmer-postgres psql -U elmer -l

# Manually create if missing
docker exec elmer-postgres createdb -U elmer orchestrator

# Try migrations again
DATABASE_URL="postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator" npm run db:migrate
```

### Cloudflare Tunnel won't connect

```bash
# Check tunnel status
cloudflared tunnel info elmer

# List all tunnels
cloudflared tunnel list

# Check the config file
cat ~/.cloudflared/config.yml

# Re-authenticate if needed
cloudflared tunnel login
```

### Site not accessible at elmer.studio

```bash
# Check DNS resolution
dig elmer.studio

# Verify tunnel is running
pgrep -f cloudflared

# Check tunnel connections
cloudflared tunnel info elmer

# Restart tunnel
pkill -f cloudflared
cloudflared tunnel run elmer
```

---

## Environment Switching

### Using Local (Development)

In `.env.local`:
```env
DATABASE_URL=postgresql://elmer:elmer_local_dev@localhost:5432/orchestrator
```

### Using Neon (Production/Staging)

In `.env.local`:
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
```

The database driver auto-detects based on the URL pattern.

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `/local` | Full setup: Docker + PostgreSQL + migrations + dev server + tunnel |
| `/local status` | Check what's running |
| `/local reset` | Wipe and recreate database |
| `/local tunnel` | Start only the Cloudflare tunnel |
| `docker compose stop` | Stop PostgreSQL (keeps data) |
| `docker compose down -v` | Stop PostgreSQL and delete data |
| `docker exec elmer-postgres psql -U elmer -d orchestrator` | Connect to database |
| `pkill -f cloudflared` | Stop the tunnel |
| `npm run start:local` | Alternative: run everything via script |
