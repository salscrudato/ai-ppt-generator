#!/bin/bash

# AI PowerPoint Generator - Development Setup
# Simplified setup script for local development

set -e

echo "🚀 AI PowerPoint Generator - Development Setup"
echo "=============================================="

# Check Node.js installation and version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install Firebase CLI if needed
if ! command -v firebase &> /dev/null; then
    echo "📦 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "  → Frontend dependencies..."
cd frontend && npm install && cd ..

echo "  → Backend dependencies..."
cd functions && npm install && cd ..

# Create environment file if missing
if [ ! -f "functions/.env" ]; then
    echo "📝 Creating environment file..."
    cat > functions/.env << EOF
# OpenAI API Key (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here
EOF
    echo "⚠️  Please edit functions/.env and add your OpenAI API key"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Add your OpenAI API key to functions/.env"
echo "2. Run './start-dev.sh' to start development servers"
echo "3. Open http://localhost:5174 in your browser"
