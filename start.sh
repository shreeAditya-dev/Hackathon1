#!/bin/bash

# AgriSentinal00 Startup Script
# Runs both Python Flask backend and React Vite frontend together.

echo "🌱 Starting AgriSentinal00..."

# Kill any previous background jobs on exit
trap 'kill 0' EXIT

# Start backend in background
echo "📡 Starting Python Flask Backend on port 5001..."
cd "$(dirname "$0")/backend" && python3 flask_server.py &

# Wait briefly for backend to initialize
sleep 2

# Start frontend
echo "💻 Starting React Vite Frontend on http://localhost:5173..."
cd "$(dirname "$0")/frontend" && npm run dev

# Wait for background processes
wait
