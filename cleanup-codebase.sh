#!/bin/bash

# Codebase Cleanup Script
# Removes unnecessary files, cleans build artifacts, and optimizes the codebase

set -e

echo "🧹 Starting AI PowerPoint Generator Codebase Cleanup"
echo "=================================================="

# Function to safely remove files/directories
safe_remove() {
    if [ -e "$1" ]; then
        echo "🗑️  Removing: $1"
        rm -rf "$1"
    else
        echo "ℹ️  Already clean: $1"
    fi
}

# Function to clean directory but keep .gitkeep
clean_directory() {
    if [ -d "$1" ]; then
        echo "🧽 Cleaning directory: $1"
        find "$1" -type f ! -name '.gitkeep' -delete 2>/dev/null || true
        find "$1" -type d -empty ! -path "$1" -delete 2>/dev/null || true
    fi
}

echo ""
echo "📁 Cleaning build artifacts..."

# Frontend build artifacts
safe_remove "frontend/dist"
safe_remove "frontend/node_modules/.vite"
safe_remove "frontend/.vite"

# Backend build artifacts  
safe_remove "functions/lib"
safe_remove "functions/firebase-debug.log"
safe_remove "functions/ui-debug.log"

echo ""
echo "🧪 Cleaning test artifacts..."

# Test output files
clean_directory "test-output"
clean_directory "functions/test-results"

# Coverage reports
safe_remove "frontend/coverage"
safe_remove "functions/coverage"

# Jest cache
safe_remove "frontend/.jest"
safe_remove "functions/.jest"

echo ""
echo "🗂️  Cleaning temporary files..."

# Log files
find . -name "*.log" -type f -delete 2>/dev/null || true
find . -name "debug.log" -type f -delete 2>/dev/null || true
find . -name "firebase-debug.log" -type f -delete 2>/dev/null || true

# OS generated files
find . -name ".DS_Store" -type f -delete 2>/dev/null || true
find . -name "Thumbs.db" -type f -delete 2>/dev/null || true
find . -name "desktop.ini" -type f -delete 2>/dev/null || true

# Editor files
find . -name "*.swp" -type f -delete 2>/dev/null || true
find . -name "*.swo" -type f -delete 2>/dev/null || true
find . -name "*~" -type f -delete 2>/dev/null || true

echo ""
echo "📦 Cleaning package manager artifacts..."

# npm cache and lock conflicts
safe_remove "frontend/package-lock.json.bak"
safe_remove "functions/package-lock.json.bak"

# Yarn artifacts (if any)
safe_remove "frontend/yarn.lock"
safe_remove "functions/yarn.lock"
safe_remove "yarn-error.log"

echo ""
echo "🔧 Cleaning development artifacts..."

# Firebase emulator data (keep structure but clean data)
if [ -d "functions/emulator-data" ]; then
    echo "🧽 Cleaning emulator data..."
    clean_directory "functions/emulator-data"
fi

# TypeScript incremental build info
find . -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

echo ""
echo "📊 Analyzing codebase size..."

# Calculate sizes
if command -v du >/dev/null 2>&1; then
    echo "Frontend size: $(du -sh frontend 2>/dev/null | cut -f1)"
    echo "Backend size: $(du -sh functions 2>/dev/null | cut -f1)"
    echo "Total size: $(du -sh . 2>/dev/null | cut -f1)"
fi

echo ""
echo "🔍 Checking for unused files..."

# Check for potential unused files
echo "Checking for potential cleanup opportunities:"

# Large files that might be unnecessary
echo "📏 Large files (>1MB):"
find . -type f -size +1M -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | head -10 || echo "None found"

# Duplicate files
echo "🔄 Potential duplicate files:"
find . -name "*.md" -type f -not -path "./node_modules/*" -not -path "./.git/*" | sort | uniq -d | head -5 || echo "None found"

echo ""
echo "✅ Cleanup completed successfully!"
echo ""
echo "📋 Summary:"
echo "- Removed build artifacts and temporary files"
echo "- Cleaned test outputs and coverage reports"
echo "- Removed OS and editor generated files"
echo "- Cleaned package manager artifacts"
echo "- Preserved important configuration and source files"
echo ""
echo "🚀 Your codebase is now clean and optimized!"
echo "Run 'npm run dev' to start development with a fresh environment."
