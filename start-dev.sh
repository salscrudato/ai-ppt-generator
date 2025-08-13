#!/bin/bash

# Start both frontend and backend in development mode
# This script starts Firebase emulators and Vite dev server

set -e

echo "🚀 Starting AI PowerPoint Generator Development Environment"
echo "========================================================="

# Function to cleanup background processes
cleanup() {
    echo "🛑 Shutting down development servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Start Firebase emulators in background
echo "🔥 Starting Firebase emulators..."
cd functions
npm run serve &
FIREBASE_PID=$!
cd ..

# Wait for Firebase emulators to start
echo "⏳ Waiting for Firebase emulators to start..."
sleep 10

# Start frontend development server
echo "⚛️  Starting React development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development environment is ready!"
echo "📱 Frontend: http://localhost:5173"
echo "🔥 Firebase Emulators: http://localhost:4000"
echo "🔧 Functions: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for background processes
wait
