#!/bin/bash
set -e

echo "======================================================="
echo "  Starting Elmer Orchestrator (Local + Cloudflare Tunnel)"
echo "======================================================="
echo ""

cd "$(dirname "$0")/.."

# Start PostgreSQL if not running
if ! docker ps | grep -q elmer-postgres; then
    echo "📦 Starting PostgreSQL..."
    docker compose up -d postgres
    sleep 3
fi

# Check database is ready
echo "⏳ Waiting for database..."
until docker exec elmer-postgres pg_isready -U elmer -d orchestrator > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Database ready!"

# Run migrations if needed
echo "🔄 Running migrations..."
npm run db:migrate

# Start the tunnel in background
echo "🌐 Starting Cloudflare Tunnel..."
cloudflared tunnel run elmer &
TUNNEL_PID=$!
sleep 2

# Start Next.js
echo "🚀 Starting Next.js..."
npm run dev &
NEXT_PID=$!

echo ""
echo "======================================================="
echo "  ✨ Elmer is now available at https://elmer.studio"
echo "======================================================="
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    kill $TUNNEL_PID 2>/dev/null || true
    kill $NEXT_PID 2>/dev/null || true
    echo "👋 Done!"
}
trap cleanup EXIT INT TERM

# Wait for either process to exit
wait
