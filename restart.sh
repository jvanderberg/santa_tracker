#!/bin/bash

# Get the directory where this script lives
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "🛑 Stopping existing servers..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

echo "🧹 Cleaning build artifacts..."
rm -rf "$SCRIPT_DIR/server/dist"
rm -rf "$SCRIPT_DIR/client/dist"

echo "🔧 Installing dependencies..."
(cd "$SCRIPT_DIR/server" && npm install)
(cd "$SCRIPT_DIR/client" && npm install)

echo "🚀 Starting server..."
(cd "$SCRIPT_DIR/server" && npm run dev) &
SERVER_PID=$!

echo "⏳ Waiting for server to start..."
sleep 3

echo "🚀 Starting client..."
(cd "$SCRIPT_DIR/client" && npm run dev) &
CLIENT_PID=$!

echo ""
echo "✅ Servers started!"
echo "   Server PID: $SERVER_PID (http://localhost:3000)"
echo "   Client PID: $CLIENT_PID (http://localhost:5173)"
echo ""
echo "To stop servers, run: lsof -ti :3000 :5173 | xargs kill -9"
