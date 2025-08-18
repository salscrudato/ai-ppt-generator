#!/bin/bash

# AI PowerPoint Generator - Enhanced Development Environment
# Starts both frontend and backend with hot reloading and seamless integration

set -e

echo "🚀 Starting AI PowerPoint Generator Development Environment"
echo "========================================================="
echo "📅 $(date)"
echo "🖥️  Platform: $(uname -s)"
echo ""

# Load configuration
CONFIG_FILE="dev-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
    echo "⚠️  Warning: dev-config.json not found, using defaults"
fi

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down development servers..."
    echo "📊 Cleaning up processes..."

    # Kill all background jobs
    jobs -p | xargs -r kill 2>/dev/null || true

    # Clean up specific ports
    lsof -ti:5175 | xargs -r kill -9 2>/dev/null || true  # Frontend
    lsof -ti:5001 | xargs -r kill -9 2>/dev/null || true  # Backend
    lsof -ti:4000 | xargs -r kill -9 2>/dev/null || true  # Emulator UI

    echo "✅ Cleanup completed"
    exit 0
}

# Set up cleanup on script exit
trap cleanup SIGINT SIGTERM EXIT

# Function to check if port is available
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use (needed for $service)"
        echo "🔧 Attempting to free port..."
        lsof -ti:$port | xargs -r kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service=$2
    local max_attempts=30
    local attempt=1

    echo "⏳ Waiting for $service to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            echo "✅ $service is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts..."
        sleep 2
        attempt=$((attempt + 1))
    done

    echo "❌ $service failed to start after $max_attempts attempts"
    return 1
}

echo ""
echo "🔍 Pre-flight checks..."

# Check required ports
check_port 5175 "Frontend (Vite)"
check_port 5001 "Backend (Firebase Functions)"
check_port 4000 "Firebase Emulator UI"

# Check if Node.js and npm are available
if ! command -v node >/dev/null 2>&1; then
    echo "❌ Node.js is not installed"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm is not installed"
    exit 1
fi

echo "✅ Pre-flight checks passed"
echo ""

# Start Firebase emulators with hot reloading
echo "🔥 Starting Firebase emulators with hot reloading..."
cd functions

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start with enhanced logging
echo "🚀 Launching backend with hot reload..."
npm run dev:watch &
FIREBASE_PID=$!
cd ..

# Wait for Firebase emulators to be ready
if ! wait_for_service "http://localhost:5001/plsfixthx-ai/us-central1/api/health" "Backend API"; then
    echo "❌ Backend failed to start"
    exit 1
fi

# Start frontend development server
echo ""
echo "⚛️  Starting React development server..."
cd frontend

# Ensure dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Start frontend with enhanced configuration
echo "🚀 Launching frontend with hot reload..."
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
if ! wait_for_service "http://localhost:5175" "Frontend"; then
    echo "❌ Frontend failed to start"
    exit 1
fi

echo ""
echo "🎉 Development environment is ready!"
echo "=================================================="
echo "📱 Frontend:           http://localhost:5175"
echo "🔥 Firebase Emulators: http://localhost:4000"
echo "🔧 Functions API:      http://localhost:5001/plsfixthx-ai/us-central1/api"
echo "🩺 Health Check:       http://localhost:5001/plsfixthx-ai/us-central1/api/health"
echo ""
echo "🔄 Hot reloading enabled for both frontend and backend"
echo "🎨 Theme consistency verification active"
echo "📊 Real-time slide preview enabled"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "=================================================="

# Monitor services and wait
echo ""
echo "🔍 Monitoring services..."
while true; do
    sleep 30

    # Check if services are still running
    if ! curl -s "http://localhost:5175" >/dev/null 2>&1; then
        echo "⚠️  Frontend service appears to be down"
    fi

    if ! curl -s "http://localhost:5001/plsfixthx-ai/us-central1/api/health" >/dev/null 2>&1; then
        echo "⚠️  Backend service appears to be down"
    fi
done
