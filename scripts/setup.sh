#!/bin/bash
set -e

echo "🔧 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "🐍 Installing backend dependencies..."
cd backend && uv sync && cd ..

echo "📝 Setting up environment files..."
[ ! -f .env ] && cp .env.example .env || echo ".env already exists"
[ ! -f backend/.env ] && cp backend/.env.example backend/.env || echo "backend/.env already exists"

echo "🐳 Starting Docker services..."
docker-compose down -v 2>/dev/null || true
docker-compose up -d

echo "✅ Setup complete!"
